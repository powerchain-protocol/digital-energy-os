//! PowerChain PET-20 Energy Token invariant primitives.
//!
//! Physical energy remains authoritative. This program only represents a
//! verified Energy Position and must never exceed canonical Wh backing.

#[derive(Clone, Debug, PartialEq)]
pub struct EnergyTokenState {
    pub authority: [u8; 32],
    pub paused: bool,
}

impl EnergyTokenState {
    pub fn assert_active(&self) -> Result<(), &'static str> {
        if self.paused { Err("program paused") } else { Ok(()) }
    }
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum RepresentationNetwork {
    Solana,
    Sui,
}

#[derive(Clone, Debug, PartialEq)]
pub struct PositionBacking {
    pub canonical_wh: u64,
    pub reserved_wh: u64,
    pub represented_solana_wh: u64,
    pub represented_sui_wh: u64,
    pub retired_wh: u64,
}

impl PositionBacking {
    pub fn active_represented_wh(&self) -> Result<u64, &'static str> {
        self.represented_solana_wh
            .checked_add(self.represented_sui_wh)
            .ok_or("representation overflow")
    }

    pub fn available_wh(&self) -> Result<u64, &'static str> {
        let represented = self.active_represented_wh()?;
        let consumed = self.reserved_wh
            .checked_add(represented).ok_or("backing overflow")?
            .checked_add(self.retired_wh).ok_or("backing overflow")?;
        self.canonical_wh.checked_sub(consumed).ok_or("active allocation exceeds backing")
    }

    pub fn assert_can_represent(&self, requested_wh: u64) -> Result<(), &'static str> {
        if requested_wh == 0 { return Err("representation amount must be positive"); }
        if requested_wh > self.available_wh()? { return Err("representation exceeds canonical backing"); }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn cross_chain_representation_never_exceeds_backing() {
        let backing = PositionBacking {
            canonical_wh: 1_000,
            reserved_wh: 100,
            represented_solana_wh: 400,
            represented_sui_wh: 300,
            retired_wh: 50,
        };
        assert_eq!(backing.available_wh().unwrap(), 150);
        assert!(backing.assert_can_represent(151).is_err());
    }
}
