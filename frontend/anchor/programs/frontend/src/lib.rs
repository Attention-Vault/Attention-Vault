#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("5V9gDAvbC4Hy75b4YvdG9BMNyBrT1m3seMWaypxUxp85");

#[program]
pub mod frontend {
    use super::*;

    pub fn create_contract(
        ctx: Context<CreateContract>,
        total_amount: u64,
        tranche_count: u64,
        recipients: Vec<Pubkey>,
    ) -> Result<()> {
        require!(
            recipients.len() as u64 == tranche_count,
            TrancheError::InvalidRecipientsCount
        );
        require!(total_amount > 0, TrancheError::InvalidAmount);
        require!(tranche_count > 0, TrancheError::InvalidTrancheCount);

        let contract = &mut ctx.accounts.contract;
        contract.owner = *ctx.accounts.owner.key;
        contract.total_amount = total_amount;
        contract.tranche_count = tranche_count;
        contract.recipients = recipients;
        contract.paid_tranches = 0;

        // Transfer the total amount from owner to the contract account
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: contract.to_account_info(),
            },
        );

        anchor_lang::system_program::transfer(cpi_context, total_amount)?;
        Ok(())
    }

    pub fn distribute_tranche(ctx: Context<DistributeTranche>) -> Result<()> {
        // First get all the data we need from the contract
        let paid_tranches = ctx.accounts.contract.paid_tranches;
        let tranche_count = ctx.accounts.contract.tranche_count;
        let total_amount = ctx.accounts.contract.total_amount;
        let expected_recipient = ctx.accounts.contract.recipients[paid_tranches as usize];
        let owner = ctx.accounts.contract.owner;
        let signer = ctx.accounts.owner.key();

        // Verify conditions
        require!(
            paid_tranches < tranche_count,
            TrancheError::AllTranchesPaid
        );

        require!(
            expected_recipient == ctx.accounts.recipient.key(),
            TrancheError::InvalidRecipient
        );

        // Verify that the signer is either the owner or the paymaster wallet
        require!(
            signer == owner || signer == Pubkey::new_from_array([5, 173, 146, 14, 43, 25, 195, 195, 61, 211, 88, 228, 220, 157, 53, 224, 196, 109, 251, 143, 180, 251, 84, 18, 234, 244, 93, 123, 240, 168, 245, 179]),
            TrancheError::InvalidSigner
        );
        
        // Calculate tranche amount
        let tranche_amount = total_amount / tranche_count;

        // Get the account infos (these need to live long enough)
        let recipient_info = ctx.accounts.recipient.to_account_info();
        let contract_info = ctx.accounts.contract.to_account_info();

        // Transfer the tranche amount to the recipient
        let mut recipient_lamports = recipient_info.try_borrow_mut_lamports()?;
        let mut contract_lamports = contract_info.try_borrow_mut_lamports()?;
        
        **recipient_lamports += tranche_amount;
        **contract_lamports -= tranche_amount;

        // Update the contract state last
        let contract = &mut ctx.accounts.contract;
        contract.paid_tranches += 1;
        
        Ok(())
    }

    pub fn close_contract(ctx: Context<CloseContract>) -> Result<()> {
        let contract = &ctx.accounts.contract;
        let remaining_balance = contract.total_amount
            - (contract.paid_tranches * (contract.total_amount / contract.tranche_count));

        if remaining_balance > 0 {
            **ctx.accounts.owner.to_account_info().try_borrow_mut_lamports()? += remaining_balance;
            **ctx.accounts.contract.to_account_info().try_borrow_mut_lamports()? -= remaining_balance;
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateContract<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 8 + 8 + 8 + (32 * 10) // Adjust space for up to 10 recipients
    )]
    pub contract: Account<'info, PaymentContract>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DistributeTranche<'info> {
    #[account(mut)]
    pub contract: Account<'info, PaymentContract>,
    /// CHECK: Recipient is verified in the instruction logic
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct CloseContract<'info> {
    #[account(mut, has_one = owner, close = owner)]
    pub contract: Account<'info, PaymentContract>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct PaymentContract {
    pub owner: Pubkey,
    pub total_amount: u64,
    pub tranche_count: u64,
    #[max_len(10)]
    pub recipients: Vec<Pubkey>,
    pub paid_tranches: u64,
}

#[error_code]
pub enum TrancheError {
    #[msg("All tranches have been paid")]
    AllTranchesPaid,
    #[msg("Invalid recipient for current tranche")]
    InvalidRecipient,
    #[msg("Number of recipients must match tranche count")]
    InvalidRecipientsCount,
    #[msg("Total amount must be greater than 0")]
    InvalidAmount,
    #[msg("Tranche count must be greater than 0")]
    InvalidTrancheCount,
    #[msg("Invalid signer - must be owner or authorized wallet")]
    InvalidSigner,
}
