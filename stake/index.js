const ethers = require('ethers');
const Utils = require('../utils');

const MIN_AUTO_STAKE_DAYS = 350;

const bigZero = ethers.utils.bigNumberify(0);

class Stake {
  static getStakes() {
    // read/return my stuff and push to store or... ?
  }

  static startStake(/* newStakedHearts, newStakedDays */) {

  }

  static endStake(/* stakeIndex, stakeIdParam */) {

  }

  static emergencyUnstake(/* stakeIndex, stakeIdParam */) {

  }

  estimateReturn(stakeIndex, stakeIdParam) {
    const currentStakes = this.getStakes();
    if (currentStakes.length === 0) {
      throw new Error('HEX: Empty stake list');
    }
    if (stakeIndex >= currentStakes.length) {
      throw new Error('HEX: stakeIndex invalid');
    }

    /* Get stake copy */
    const st = currentStakes[stakeIndex];
    if (stakeIdParam !== st.stakeId) {
      throw new Error('HEX: stakeIdParam not in stake');
    }

    let servedDays = 0;
    const currentDay = Utils.getCurrentDay();
    const prevUnpooled = (st.unpooledDay !== 0);
    let stakeReturn = bigZero;

    if (currentDay >= st.pooledDay) {
      if (prevUnpooled) {
        /* Previously unpooled in goodAccounting(), so must have served full term */
        servedDays = st.stakedDays;
      } else {
        st.unpooledDay = currentDay;

        servedDays = currentDay - st.pooledDay;
        if (servedDays > st.stakedDays) {
          servedDays = st.stakedDays;
        } else if (st.isAutoStake && servedDays < MIN_AUTO_STAKE_DAYS) {
          /* Deny early-unstake before an auto-stake minimum has been served */
          throw new Error('HEX: Auto-stake still locked');
        }
      }

      stakeReturn = Utils.calcStakeReturn(Utils.getDailyPayoutData(),
        st, servedDays);
    } else {
      stakeReturn = st.stakedHearts;
    }

    return stakeReturn;
  }
}

module.exports = Stake;
