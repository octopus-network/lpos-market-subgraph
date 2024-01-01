import { BigInt } from "@graphprotocol/graph-ts";
import { Delegator, DelegatorReward, DelegatorTotalReward, DelegatorsUnclaimReward, ValidatorReward, ValidatorTotalReward, ValidatorsUnclaimReward } from "../../generated/schema";

export class RewardHelper {


	static reward_id(account_id: string, reward_token_id: string): string {
		return `${account_id}--${reward_token_id}`
	}

	static delegatorReceiveReward(delegator_id: string, reward_token_id: string, reward_token_amount: BigInt): void {
		let delegator_reward = DelegatorReward.load(this.reward_id(delegator_id, reward_token_id))
		let delegator_total_reward = DelegatorTotalReward.load(this.reward_id(delegator_id, reward_token_id))

		if(!delegator_reward) {
			delegator_reward = new DelegatorReward(this.reward_id(delegator_id, reward_token_id))
			delegator_reward.reward_token_amount = BigInt.zero()
		}

		if(!delegator_total_reward) {
			delegator_total_reward = new DelegatorTotalReward(this.reward_id(delegator_id, reward_token_id))
			delegator_total_reward.reward_token_amount = BigInt.zero()

		}

		delegator_reward.delegator = delegator_id
		delegator_reward.reward_token_id = reward_token_id
		delegator_reward.reward_token_amount = reward_token_amount.plus(delegator_reward.reward_token_amount) 

		delegator_reward.save()

		delegator_total_reward.delegator = delegator_id
		delegator_total_reward.reward_token_id = reward_token_id
		delegator_total_reward.reward_token_amount = reward_token_amount.plus(delegator_total_reward.reward_token_amount)

		delegator_total_reward.save()

		let delegators_unclaim_rewards = DelegatorsUnclaimReward.load(reward_token_id) 
		if(!delegators_unclaim_rewards) {
			delegators_unclaim_rewards = new DelegatorsUnclaimReward(reward_token_id);
			delegators_unclaim_rewards.reward_token_id = reward_token_id
			delegators_unclaim_rewards.reward_token_amount = BigInt.zero()
		}
		delegators_unclaim_rewards.reward_token_amount = reward_token_amount.plus(delegators_unclaim_rewards.reward_token_amount)
		delegators_unclaim_rewards.save()
	}

	static validatorReceiveReward(validator_id: string, reward_token_id: string, reward_token_amount: BigInt): void {
		let validator_reward = ValidatorReward.load(this.reward_id(validator_id, reward_token_id))
		let validator_total_reward = ValidatorTotalReward.load(this.reward_id(validator_id, reward_token_id))

		if(!validator_reward) {
			validator_reward = new ValidatorReward(this.reward_id(validator_id, reward_token_id))
			validator_reward.reward_token_amount = BigInt.zero()
		}

		if(!validator_total_reward) {
			validator_total_reward = new ValidatorTotalReward(this.reward_id(validator_id, reward_token_id))
			validator_total_reward.reward_token_amount = BigInt.zero()

		}

		validator_reward.validator = validator_id
		validator_reward.reward_token_id = reward_token_id
		validator_reward.reward_token_amount = reward_token_amount.plus(validator_reward.reward_token_amount) 

		validator_reward.save()

		validator_total_reward.validator = validator_id
		validator_total_reward.reward_token_id = reward_token_id
		validator_total_reward.reward_token_amount = reward_token_amount.plus(validator_total_reward.reward_token_amount) 

		validator_total_reward.save()

		let validators_unclaim_rewards = ValidatorsUnclaimReward.load(reward_token_id) 
		if(!validators_unclaim_rewards) {
			validators_unclaim_rewards = new ValidatorsUnclaimReward(reward_token_id);
			validators_unclaim_rewards.reward_token_id = reward_token_id
			validators_unclaim_rewards.reward_token_amount = BigInt.zero()
		}
		validators_unclaim_rewards.reward_token_amount = reward_token_amount.plus(validators_unclaim_rewards.reward_token_amount)
		validators_unclaim_rewards.save()
	}

	static delegatorClaimReward(delegator_id: string, reward_token_id: string, reward_token_amount: BigInt): void {
		let delegator_reward = DelegatorReward.load(this.reward_id(delegator_id, reward_token_id))!
		
		delegator_reward.reward_token_amount = delegator_reward.reward_token_amount.minus(reward_token_amount) 

		delegator_reward.save()

		let delegators_unclaim_rewards = DelegatorsUnclaimReward.load(reward_token_id)! 
		delegators_unclaim_rewards.reward_token_amount = delegators_unclaim_rewards.reward_token_amount.minus(reward_token_amount)
		delegators_unclaim_rewards.save()

	}

	static validatorClaimReward(validator_id: string, reward_token_id: string, reward_token_amount: BigInt): void {
		let validator_reward = ValidatorReward.load(this.reward_id(validator_id, reward_token_id))!
		
		validator_reward.reward_token_amount = validator_reward.reward_token_amount.minus(reward_token_amount) 

		validator_reward.save()

		let validators_unclaim_rewards = ValidatorsUnclaimReward.load(reward_token_id)! 
		validators_unclaim_rewards.reward_token_amount = validators_unclaim_rewards.reward_token_amount.minus(reward_token_amount)
		validators_unclaim_rewards.save()
	}

}