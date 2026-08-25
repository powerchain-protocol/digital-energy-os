//! PowerChain Carbon Credit Token (CCT) domain controls.
//! Physical / verification evidence remains authoritative; this module only validates
//! issuance and retirement accounting before a Token-2022 instruction is prepared.

pub const CCT_SYMBOL: &str = "CCT";
pub const CCT_DECIMALS: u8 = 9;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct CarbonCreditPosition {
    pub verified_amount: u64,
    pub issued_amount: u64,
    pub retired_amount: u64,
    pub invalidated_amount: u64,
}

impl CarbonCreditPosition {
    pub fn available_for_issuance(&self) -> Option<u64> {
        self.verified_amount
            .checked_sub(self.invalidated_amount)?
            .checked_sub(self.issued_amount)
    }
    pub fn assert_issue(&self, amount: u64) -> bool {
        amount > 0 && self.available_for_issuance().map(|available| amount <= available).unwrap_or(false)
    }
    pub fn assert_retire(&self, amount: u64) -> bool {
        amount > 0 && self.retired_amount.checked_add(amount).map(|next| next <= self.issued_amount).unwrap_or(false)
    }
}

pub fn evidence_required(evidence_hash: &[u8; 32]) -> bool {
    evidence_hash.iter().any(|value| *value != 0)
}
