//! PowerChain Checkout/Escrow invariant primitives.
//!
//! The on-chain boundary accepts externally authorized wallet transactions;
//! it never signs on behalf of the user.

#[derive(Clone, Debug, PartialEq)]
pub struct EscrowState {
    pub authority: [u8; 32],
    pub paused: bool,
}

impl EscrowState {
    pub fn assert_active(&self) -> Result<(), &'static str> {
        if self.paused { Err("program paused") } else { Ok(()) }
    }
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum CheckoutState {
    Created,
    Review,
    PendingSignature,
    Submitted,
    Confirmed,
    Cancelled,
    Expired,
}

pub fn assert_checkout_transition(current: CheckoutState, next: CheckoutState) -> Result<(), &'static str> {
    use CheckoutState::*;
    let allowed = matches!(
        (current, next),
        (Created, Review)
            | (Created, Cancelled)
            | (Review, PendingSignature)
            | (Review, Cancelled)
            | (PendingSignature, Submitted)
            | (PendingSignature, Cancelled)
            | (Submitted, Confirmed)
    );
    if current == next || allowed { Ok(()) } else { Err("invalid checkout transition") }
}

pub fn assert_external_signature(reference: &[u8]) -> Result<(), &'static str> {
    if reference.len() < 32 { Err("external wallet signature/reference is required") } else { Ok(()) }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn confirmation_cannot_skip_wallet_submission() {
        assert!(assert_checkout_transition(CheckoutState::Review, CheckoutState::Confirmed).is_err());
        assert!(assert_checkout_transition(CheckoutState::Submitted, CheckoutState::Confirmed).is_ok());
    }
}
