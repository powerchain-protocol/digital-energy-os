//! PowerChain Marketplace invariant primitives.
//!
//! These types model deterministic inventory and order constraints shared by
//! the Anchor implementation. They do not authorize custodial wallet signing.

#[derive(Clone, Debug, PartialEq)]
pub struct MarketplaceState {
    pub authority: [u8; 32],
    pub paused: bool,
}

impl MarketplaceState {
    pub fn assert_active(&self) -> Result<(), &'static str> {
        if self.paused { Err("program paused") } else { Ok(()) }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ListingInventory {
    pub inventory: u64,
    pub remaining: u64,
}

impl ListingInventory {
    pub fn validate(&self) -> Result<(), &'static str> {
        if self.inventory == 0 { return Err("inventory must be positive"); }
        if self.remaining > self.inventory { return Err("remaining exceeds inventory"); }
        Ok(())
    }

    pub fn reserve(&mut self, quantity: u64) -> Result<(), &'static str> {
        self.validate()?;
        if quantity == 0 { return Err("reservation quantity must be positive"); }
        if quantity > self.remaining { return Err("reservation exceeds remaining inventory"); }
        self.remaining = self.remaining.checked_sub(quantity).ok_or("inventory underflow")?;
        Ok(())
    }

    pub fn release(&mut self, quantity: u64) -> Result<(), &'static str> {
        if quantity == 0 { return Err("release quantity must be positive"); }
        let next = self.remaining.checked_add(quantity).ok_or("inventory overflow")?;
        if next > self.inventory { return Err("released inventory exceeds original inventory"); }
        self.remaining = next;
        Ok(())
    }
}

pub fn checked_order_amount(unit_amount_minor: u64, quantity: u64) -> Result<u64, &'static str> {
    if unit_amount_minor == 0 { return Err("unit amount must be positive"); }
    if quantity == 0 { return Err("quantity must be positive"); }
    unit_amount_minor.checked_mul(quantity).ok_or("order amount overflow")
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn inventory_cannot_be_oversubscribed() {
        let mut inventory = ListingInventory { inventory: 10, remaining: 10 };
        inventory.reserve(7).unwrap();
        assert_eq!(inventory.remaining, 3);
        assert!(inventory.reserve(4).is_err());
    }
}
