use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("BTrpp9nc2eP12y1SHSAWWyHNKUPFffR5EcSkcFVNJbRv");

const MAX_REPO_LEN: usize = 100;

#[program]
pub mod autopay_bounties {
    use super::*;

    pub fn initialize_bounty(
        ctx: Context<InitializeBounty>,
        repo: String,
        issue_number: u64,
        amount: u64,
        authority: Pubkey,
    ) -> Result<()> {
        require!(repo.len() <= MAX_REPO_LEN, AutoPayError::RepoTooLong);
        require!(amount > 0, AutoPayError::InvalidAmount);

        let bounty = &mut ctx.accounts.bounty;
        bounty.creator = ctx.accounts.creator.key();
        bounty.authority = authority;
        bounty.repo = repo;
        bounty.issue_number = issue_number;
        bounty.amount = amount;
        bounty.is_paid = false;
        bounty.bump = ctx.bumps.bounty;

        let cpi_accounts = Transfer {
            from: ctx.accounts.creator.to_account_info(),
            to: ctx.accounts.bounty.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_accounts);
        transfer(cpi_ctx, amount)?;

        Ok(())
    }

    pub fn release_payment(
        ctx: Context<ReleasePayment>,
        issue_number: u64,
        developer_wallet: Pubkey,
    ) -> Result<()> {
        require!(!ctx.accounts.bounty.is_paid, AutoPayError::AlreadyPaid);
        require!(
            developer_wallet == ctx.accounts.developer.key(),
            AutoPayError::DeveloperMismatch
        );
        require!(
            ctx.accounts.bounty.issue_number == issue_number,
            AutoPayError::IssueNumberMismatch
        );

        let bounty = &ctx.accounts.bounty;
        let creator = bounty.creator;
        let bump = bounty.bump;
        let amount = bounty.amount;

        let seeds = &[
            b"bounty",
            creator.as_ref(),
            &issue_number.to_le_bytes(),
            &[bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.bounty.to_account_info(),
            to: ctx.accounts.developer.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        transfer(cpi_ctx, amount)?;

        ctx.accounts.bounty.is_paid = true;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(repo: String, issue_number: u64, amount: u64, authority: Pubkey)]
pub struct InitializeBounty<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        init,
        payer = creator,
        seeds = [b"bounty", creator.key().as_ref(), &issue_number.to_le_bytes()],
        bump,
        space = 8 + Bounty::INIT_SPACE
    )]
    pub bounty: Account<'info, Bounty>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(issue_number: u64, developer_wallet: Pubkey)]
pub struct ReleasePayment<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"bounty", bounty.creator.as_ref(), &issue_number.to_le_bytes()],
        bump = bounty.bump,
        has_one = authority @ AutoPayError::Unauthorized
    )]
    pub bounty: Account<'info, Bounty>,
    /// CHECK: Recipient wallet to receive payout.
    #[account(mut)]
    pub developer: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Bounty {
    pub creator: Pubkey,
    pub authority: Pubkey,
    #[max_len(MAX_REPO_LEN)]
    pub repo: String,
    pub issue_number: u64,
    pub amount: u64,
    pub is_paid: bool,
    pub bump: u8,
}

#[error_code]
pub enum AutoPayError {
    #[msg("Repository name is too long.")]
    RepoTooLong,
    #[msg("Amount must be greater than zero.")]
    InvalidAmount,
    #[msg("Bounty has already been paid.")]
    AlreadyPaid,
    #[msg("Caller is not the bounty authority.")]
    Unauthorized,
    #[msg("Developer account does not match requested wallet.")]
    DeveloperMismatch,
    #[msg("Issue number does not match bounty.")]
    IssueNumberMismatch,
}
