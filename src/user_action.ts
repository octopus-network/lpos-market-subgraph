import { BigInt, log, near } from "@graphprotocol/graph-ts";
import { JSON } from "assemblyscript-json";
import { DecreaseDelegationAction, DecreaseStakeAction, DelegateAction, DelegatorClaimRewardAction, DelegatorReceiveRewardAction, DeployAction, DeregisterConsumerChainAction, IncreaseDelegationAction, IncreaseStakeAction, PingAction, RegisterConsumerChainAction, RegisterConsumerChainInLposMarketAction, RequestSlashAction, RestakeAction, StakeAction, StakerAndConsumerChain, StakerBondAction, StakerChangeKeyAction, StakerDecreaseStakeAction, StakerIncreaseStakeAction, StakerStakeAction, StakerUnbondAction, StakerUnstakeAction, UndelegateAction, UpdateConsumerChainAction, UserAction, ValidatorClaimRewardAction, ValidatorPingAction, ValidatorReceiveRewardAction, WithdrawAction } from "../generated/schema";
import { convertStringToBigInt } from "./util";


export type ActionId = string

export namespace action_types {
	export type ActionType = string
  
	export const ping_action = 'ping_action'
	export const staker_stake_action = 'staker_stake_action'
	export const staker_increase_stake_action = 'staker_increase_stake_action'
	export const staker_decrease_stake_action = 'staker_decrease_stake_action'
	export const staker_unstake_action = 'staker_unstake_action'

	export const staker_bond_action = 'staker_bond_action' 
	export const staker_unbond_action = 'staker_unbond_action' 
	export const staker_change_key_action = 'staker_change_key_action' 

	export const register_consumer_chain_action = 'register_consumer_chain_action'
	export const register_consumer_chain_in_lpos_market_action = 'register_consumer_chain_in_lpos_market_action'
  	export const update_consumer_chain_action = 'update_consumer_chain_action'
    export const deregister_consumer_chain_action = 'deregister_consumer_chain_action'
    export const request_slash_action = 'request_slash_action'
  
	export const validator_ping_action = 'validator_ping_action'
	export const deploy_action = 'deploy_action'
	export const stake_action = 'stake_action'
	export const increase_stake_action = 'increase_stake_action'
	export const decrease_stake_action = 'decrease_stake_action'
  
	export const restake_action = 'restake_action'
	export const unrestake_action = 'unrestake_action'
	export const change_key_action = 'change_key_action'

	export const delegate_action = 'delegate_action'
	export const increase_delegation_action = 'increase_delegation_action'
	export const decrease_delegation_action = 'decrease_delegation_action'
	export const undelegate_action = 'undelegate_action'
  
	export const withdraw_action = 'withdraw_action'
	export const delegator_receive_reward_action = 'delegator_receive_reward_action'
	export const validator_receive_reward_action = 'validator_receive_reward_action'
	export const delegator_claim_reward_action = 'delegator_claim_reward_action'
	export const validator_claim_reward_action = 'validator_claim_reward_action'
  
  }

export class UserActionHelp {

	static user_action_id(action_type: action_types.ActionType ,  receipt_id: near.CryptoHash, log_id: number): ActionId {
		return `${receipt_id.toBase58()}-${log_id}-${action_type}`
	}

	static new_user_action(action_type: action_types.ActionType ,  receipt: near.ReceiptWithOutcome, log_id: number): UserAction {
		let user_action = new UserAction(this.user_action_id(action_type, receipt.receipt.id, log_id))
		user_action.timestamp = BigInt.fromU64(receipt.block.header.timestampNanosec)
		user_action.timestamp_plus_log_index = user_action.timestamp.plus(BigInt.fromU64(log_id as u64))
		user_action.predecessor_id = receipt.receipt.predecessorId
		user_action.signer_id = receipt.receipt.signerId
		user_action.user_id = receipt.receipt.signerId
		user_action.receipt_id = receipt.receipt.id.toBase58()
		user_action.action_type = action_type
	
		return user_action
	}

	static new_ping_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number): void {
		let user_action = this.new_user_action(action_types.ping_action, receipt, log_id)
		let ping_action = new PingAction(user_action.id)
		ping_action.pool_id = data.getString("pool_id")!.valueOf()
		ping_action.new_total_staked_balance = BigInt.fromString(data.getString("new_total_staked_balance")!.valueOf())

		ping_action.save()

		user_action.ping_action = user_action.id
		user_action.save()
	}

	static new_staker_stake_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number): UserAction {
		let user_action = this.new_user_action(action_types.staker_stake_action, receipt, log_id)
		let sequence = data.getString("sequence")!.valueOf()
		let staker_stake_action = new StakerStakeAction(`action_types.staker_stake_action-${sequence}`)
		staker_stake_action.select_pool = data.getString("select_pool")!.valueOf()
		staker_stake_action.stake_amount = BigInt.fromString(data.getString("stake_amount")!.valueOf())
		staker_stake_action.increase_shares = BigInt.fromString(data.getString("stake_amount")!.valueOf())
		staker_stake_action.sequence = BigInt.fromString(sequence)
		staker_stake_action.save()

		user_action.staker_stake_action = staker_stake_action.id
		user_action.save()
		return user_action
	}

	static new_staker_increase_stake_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.staker_increase_stake_action, receipt, log_id)
		let sequence = data.getString("sequence")!.valueOf()
		let staker_increase_stake_action = new StakerIncreaseStakeAction(`${user_action.action_type}-${sequence}`)
		staker_increase_stake_action.increase_shares = BigInt.fromString(data.getString("increase_shares")!.valueOf())
		staker_increase_stake_action.increase_stake_amount = BigInt.fromString(data.getString("increase_stake_amount")!.valueOf())
		staker_increase_stake_action.sequence = BigInt.fromString(sequence)
		staker_increase_stake_action.save()

		user_action.staker_increase_stake_action = staker_increase_stake_action.id	
		user_action.save()
	}

	static new_staker_decrease_stake_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.staker_decrease_stake_action, receipt, log_id)
		let sequence = data.getString("sequence")!.valueOf()
		let staker_decrease_stake_action = new StakerDecreaseStakeAction(`${user_action.action_type}-${sequence}`)
		staker_decrease_stake_action.decrease_shares = BigInt.fromString(data.getString("decrease_shares")!.valueOf())
		staker_decrease_stake_action.decrease_stake_amount = BigInt.fromString(data.getString("decrease_stake_amount")!.valueOf())
		staker_decrease_stake_action.withdraw_certificate = BigInt.fromString(data.getString("withdraw_certificate")!.valueOf())
		staker_decrease_stake_action.sequence = BigInt.fromString(sequence)

		staker_decrease_stake_action.save()

		user_action.staker_decrease_stake_action = staker_decrease_stake_action.id

		user_action.save()

	}

	static new_staker_unstake_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.staker_unstake_action, receipt, log_id)
		let sequence = data.getString("sequence")!.valueOf()
		let staker_unstake_action = new StakerUnstakeAction(`${user_action.action_type}-${sequence}`)
		staker_unstake_action.decrease_stake_amount = BigInt.fromString(data.getString("decrease_stake_amount")!.valueOf())
		staker_unstake_action.decrease_shares = BigInt.fromString(data.getString("decrease_shares")!.valueOf())
		staker_unstake_action.withdraw_certificate  = BigInt.fromString(data.getString("withdraw_certificate")!.valueOf())
		staker_unstake_action.sequence = BigInt.fromString(sequence)

		staker_unstake_action.save()

		user_action.staker_unstake_action = staker_unstake_action.id
		user_action.save()
	}

	static new_staker_bond_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.staker_bond_action, receipt, log_id)
		let staker_bond_action = new StakerBondAction(user_action.id)
		staker_bond_action.staker_id = data.getString("staker_id")!.valueOf()
		staker_bond_action.consumer_chain_id = data.getString("consumer_chain_id")!.valueOf()
		staker_bond_action.key = data.getString("key")!.valueOf()

		staker_bond_action.save()
		user_action.staker_bond_action = staker_bond_action.id
		user_action.save()
	}
	
	static new_staker_change_key_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.staker_change_key_action, receipt, log_id)
		let staker_change_key_action = new StakerChangeKeyAction(user_action.id)
		let staker_id = data.getString("staker_id")!.valueOf()
		let consumer_chain_id = data.getString("consumer_chain_id")!.valueOf()
		staker_change_key_action.staker_id = staker_id
		staker_change_key_action.consumer_chain_id = consumer_chain_id
		let old_key = StakerAndConsumerChain.load(`${staker_id}-${consumer_chain_id}`)!.key
		staker_change_key_action.old_key = old_key
		staker_change_key_action.new_key = data.getString("key")!.valueOf()

		staker_change_key_action.save()

		user_action.staker_change_key_action = staker_change_key_action.id
		user_action.save()
	}

	static new_staker_unbond_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.staker_unbond_action, receipt, log_id)
		let staker_unbond_action = new StakerUnbondAction(user_action.id)
		staker_unbond_action.staker_id = data.getString("staker_id")!.valueOf()
		staker_unbond_action.consumer_chain_id = data.getString("consumer_chain_id")!.valueOf()

		staker_unbond_action.save()
		user_action.staker_unbond_action = staker_unbond_action.id
		user_action.save()
	}

	static new_register_consumer_chain_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.register_consumer_chain_action, receipt, log_id)
		let register_consumer_chain_action = new RegisterConsumerChainAction(user_action.id)

		register_consumer_chain_action.consumer_chain_register_param = data.getObj("consumer_chain_register_param")!.stringify()

		register_consumer_chain_action.save()

		user_action.register_consumer_chain_action = user_action.id
		user_action.save()
	}

	static new_register_consumer_chain_in_lpos_market_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number): void {
		let user_action = this.new_user_action(action_types.register_consumer_chain_in_lpos_market_action, receipt, log_id)
		let register_consumer_chain_in_lpos_market_action = new RegisterConsumerChainInLposMarketAction(user_action.id)

		register_consumer_chain_in_lpos_market_action.consumer_chain_id = data.getString("consumer_chain_id")!.valueOf()
		register_consumer_chain_in_lpos_market_action.anchor_id = data.getString("anchor_id")!.valueOf()

		register_consumer_chain_in_lpos_market_action.save()

		user_action.register_consumer_chain_in_lpos_market_action = user_action.id
		user_action.save()
	}

	static new_update_consumer_chain_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.update_consumer_chain_action, receipt, log_id)
		let update_consumer_chain_action = new UpdateConsumerChainAction(user_action.id)

		update_consumer_chain_action.consumer_chain_update_param = data.getObj("consumer_chain_update_param")!.stringify()

		update_consumer_chain_action.save()

		user_action.update_consumer_chain_action = user_action.id
		user_action.save()

	}

	static new_deregister_consumer_chain_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.deregister_consumer_chain_action, receipt, log_id)
		let deregister_consumer_chain_action = new DeregisterConsumerChainAction(user_action.id)
		deregister_consumer_chain_action.save()

		user_action.deregister_consumer_chain_action = user_action.id
		user_action.save()

	}

	static new_request_slash_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.request_slash_action, receipt, log_id)
		let request_slash_action = new RequestSlashAction(user_action.id)
		request_slash_action.save()

		user_action.request_slash_action = user_action.id
		user_action.save()

	}

	static new_validator_ping_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.validator_ping_action, receipt, log_id)
		let validator_ping_action = new ValidatorPingAction(user_action.id)
		validator_ping_action.validator_id = data.getString("validator_id")!.valueOf()
		validator_ping_action.new_total_staked_balance = BigInt.fromString(data.getString("new_total_staked_balance")!.valueOf())

		validator_ping_action.save()

		user_action.validator_ping_action = user_action.id
		user_action.save()
	}

	static new_deploy_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.deploy_action, receipt, log_id)
		let deploy_action = new DeployAction(user_action.id)
		deploy_action.escrow_id = data.getString("escrow_id")!.valueOf()
		deploy_action.deploy_fee = BigInt.fromString(data.getString("deploy_fee")!.valueOf())

		deploy_action.save()

		user_action.deploy_action = user_action.id
		user_action.save()
	}

	static new_stake_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {

		let user_action = this.new_user_action(action_types.stake_action, receipt, log_id)
		let stake_action = new StakeAction(user_action.id)
		stake_action.select_pool_id = data.getString("select_pool_id")!.valueOf() 
		stake_action.stake_amount = BigInt.fromString(data.getString("stake_amount")!.valueOf())
		stake_action.increase_shares = BigInt.fromString(data.getString("increase_shares")!.valueOf())

		stake_action.save()

		user_action.stake_action = user_action.id
		user_action.save()
	}

	static new_increase_stake_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {

		let user_action = this.new_user_action(action_types.increase_stake_action, receipt, log_id)
		let increase_stake_action = new IncreaseStakeAction(user_action.id)
		increase_stake_action.increase_stake_amount = BigInt.fromString(data.getString("increase_stake_amount")!.valueOf())
		increase_stake_action.increase_shares = BigInt.fromString(data.getString("increase_shares")!.valueOf())

		increase_stake_action.save()

		user_action.increase_stake_action = user_action.id
		user_action.save()
	}

	static new_decrease_stake_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {

		let user_action = this.new_user_action(action_types.decrease_stake_action, receipt, log_id)
		let decrease_stake_action = new DecreaseStakeAction(user_action.id)
		decrease_stake_action.decrease_stake_amount = BigInt.fromString(data.getString("decrease_stake_amount")!.valueOf())
		decrease_stake_action.decrease_shares = BigInt.fromString(data.getString("decrease_shares")!.valueOf())

		decrease_stake_action.save()

		user_action.decrease_stake_action = user_action.id
		user_action.save()
	}

	static new_restake_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.restake_action, receipt, log_id)
		let restake_action = new RestakeAction(user_action.id)

		// .decrease_stake_amount = BigInt.fromString(data.getString("decrease_stake_amount")!.valueOf())
		// decrease_stake_action.decrease_shares = BigInt.fromString(data.getString("decrease_shares")!.valueOf())

		restake_action.save()

		user_action.restake_action = user_action.id
		user_action.save()

	}
	static new_unrestake_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
	}
	static new_change_key_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
	}
	static new_delegate_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.delegate_action, receipt, log_id)
		let delegate_action = new DelegateAction(user_action.id)
		delegate_action.validator_id =  data.getObj("validator_info")!.getString("validator_id")!.valueOf()
		delegate_action.delegate_amount = BigInt.fromString(data.getString("delegate_amount")!.valueOf()) 
		delegate_action.increase_shares = BigInt.fromString(data.getString("increase_shares")!.valueOf())

		delegate_action.save()

		user_action.delegate_action = user_action.id	
		user_action.save()
	}
	static new_increase_delegation_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.increase_delegation_action, receipt, log_id)
		let increase_delegation_action = new IncreaseDelegationAction(user_action.id)
		increase_delegation_action.increase_delegation_amount = BigInt.fromString(data.getString("increase_delegation_amount")!.valueOf()) 
		increase_delegation_action.increase_shares = BigInt.fromString(data.getString("increase_shares")!.valueOf())

		increase_delegation_action.save()

		user_action.increase_delegation_action = user_action.id
		user_action.save()
	}
	static new_decrease_delegation_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number): UserAction {
		let user_action = this.new_user_action(action_types.decrease_delegation_action, receipt, log_id)
		let decrease_delegation_action = new DecreaseDelegationAction(user_action.id)
		decrease_delegation_action.decrease_delegation_amount = BigInt.fromString(data.getString("decrease_delegation_amount")!.valueOf())
		decrease_delegation_action.decrease_shares = BigInt.fromString(data.getString("decrease_shares")!.valueOf())
		decrease_delegation_action.sequence = BigInt.fromString(data.getString("sequence")!.valueOf())
		decrease_delegation_action.staker_decrease_stake_action = `${action_types.staker_decrease_stake_action}-${decrease_delegation_action.sequence}`

		decrease_delegation_action.save()

		user_action.decrease_deleation_action = user_action.id
		user_action.save()
		return user_action
	}
	static new_undelegate_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number): UserAction {
		let user_action = this.new_user_action(action_types.undelegate_action, receipt, log_id)
		let undelegate_action = new UndelegateAction(user_action.id)
		undelegate_action.decrease_delegation_amount = BigInt.fromString(data.getString("decrease_delegation_amount")!.valueOf())
		undelegate_action.decrease_shares = BigInt.fromString(data.getString("decrease_shares")!.valueOf())
		undelegate_action.sequence = BigInt.fromString(data.getString("sequence")!.valueOf())
		undelegate_action.staker_decrease_stake_action = `${action_types.staker_decrease_stake_action}-${undelegate_action.sequence}`

		undelegate_action.save()

		user_action.undelegate_action = user_action.id
		user_action.save()
		return user_action
	}

	static new_withdraw_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):UserAction {
		let user_action = this.new_user_action(action_types.withdraw_action, receipt, log_id)
		let withdraw_action = new WithdrawAction(user_action.id)
		withdraw_action.withdraw_certificate_id = data.getString("withdraw_certificate")!.valueOf() 
		withdraw_action.amount = BigInt.fromString(data.getString("increase_shares")!.valueOf())

		withdraw_action.withdrawal = withdraw_action.withdraw_certificate_id

		withdraw_action.save()

		user_action.withdraw_action = user_action.id
		user_action.save()
		return user_action
	}

	static new_delegator_receive_reward_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.delegator_receive_reward_action, receipt, log_id)
		let delegator_receive_reward_action = new DelegatorReceiveRewardAction(user_action.id)
		delegator_receive_reward_action.reward_token_id = data.getString("reward_token_id")!.valueOf()
		delegator_receive_reward_action.reward_token_amount = BigInt.fromString(data.getString("reward_token_amount")!.valueOf()) 
		delegator_receive_reward_action.receiver = data.getString("delegator_id")!.valueOf() 

		delegator_receive_reward_action.save()

		user_action.delegator_receive_reward_action = user_action.id
		user_action.save()
	}

	static new_validator_receive_reward_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.validator_receive_reward_action, receipt, log_id)
		let validator_receive_reward_action = new ValidatorReceiveRewardAction(user_action.id)
		validator_receive_reward_action.reward_token_id = data.getString("reward_token_id")!.valueOf()
		validator_receive_reward_action.reward_token_amount = BigInt.fromString(data.getString("reward_token_amount")!.valueOf()) 
		validator_receive_reward_action.receiver = data.getString("validator_id")!.valueOf() 

		validator_receive_reward_action.save()

		user_action.validator_receive_reward_action = user_action.id
		user_action.save()
	}

	static new_delegator_claim_reward_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.delegator_claim_reward_action, receipt, log_id)
		let delegator_claim_reward_action = new DelegatorClaimRewardAction(user_action.id)
		delegator_claim_reward_action.reward_token_id = data.getString("reward_token_id")!.valueOf()
		delegator_claim_reward_action.reward_token_amount = BigInt.fromString(data.getString("reward_token_amount")!.valueOf()) 
		delegator_claim_reward_action.receiver = data.getString("delegator_id")!.valueOf() 

		delegator_claim_reward_action.save()

		user_action.delegator_claim_reward_action = user_action.id
		user_action.save()
	}

	static new_validator_claim_reward_action(data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_id: number):void {
		let user_action = this.new_user_action(action_types.validator_claim_reward_action, receipt, log_id)
		let validator_claim_reward_action = new ValidatorClaimRewardAction(user_action.id)
		validator_claim_reward_action.reward_token_id = data.getString("reward_token_id")!.valueOf()
		validator_claim_reward_action.reward_token_amount = BigInt.fromString(data.getString("reward_token_amount")!.valueOf()) 
		validator_claim_reward_action.receiver = data.getString("validator_id")!.valueOf() 

		validator_claim_reward_action.save()

		user_action.validator_claim_reward_action = user_action.id
		user_action.save()
	}
}