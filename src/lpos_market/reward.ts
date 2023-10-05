import { BigInt } from "@graphprotocol/graph-ts";
import { Delegator, DelegatorReward, ValidatorReward } from "../../generated/schema";

export class RewardHelper {


	static reward_id(validator_or_delegator_id: string, reward_token_id: string): string {
		return `${validator_or_delegator_id}--${reward_token_id}`
	}

	static delegatorReceiveReward(delegator_id: string, reward_token_id: string, reward_token_amount: BigInt): void {
		let delegator_reward = DelegatorReward.load(this.reward_id(delegator_id, reward_token_id))

		if(!delegator_reward) {
			delegator_reward = new DelegatorReward(this.reward_id(delegator_id, reward_token_id))
			delegator_reward.reward_token_amount = BigInt.zero()
		}
		delegator_reward.delegator = delegator_id
		delegator_reward.reward_token_id = reward_token_id
		delegator_reward.reward_token_amount = reward_token_amount.plus(delegator_reward.reward_token_amount) 

		delegator_reward.save()
	}

	static validatorReceiveReward(validator_id: string, reward_token_id: string, reward_token_amount: BigInt): void {
		let validator_reward = ValidatorReward.load(this.reward_id(validator_id, reward_token_id))

		if(!validator_reward) {
			validator_reward = new ValidatorReward(this.reward_id(validator_id, reward_token_id))
			validator_reward.reward_token_amount = BigInt.zero()
		}
		validator_reward.validator = validator_id
		validator_reward.reward_token_id = reward_token_id
		validator_reward.reward_token_amount = reward_token_amount.plus(validator_reward.reward_token_amount) 

		validator_reward.save()
	}

	static delegatorClaimReward(delegator_id: string, reward_token_id: string, reward_token_amount: BigInt): void {
		let delegator_reward = DelegatorReward.load(this.reward_id(delegator_id, reward_token_id))!
		
		delegator_reward.reward_token_amount = delegator_reward.reward_token_amount.minus(reward_token_amount) 

		delegator_reward.save()

	}

	static validatorClaimReward(validator_id: string, reward_token_id: string, reward_token_amount: BigInt): void {
		let validator_reward = ValidatorReward.load(this.reward_id(validator_id, reward_token_id))!
		
		validator_reward.reward_token_amount = validator_reward.reward_token_amount.minus(reward_token_amount) 

		validator_reward.save()
	}

}