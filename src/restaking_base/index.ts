import { log, near } from "@graphprotocol/graph-ts";
import { JSON } from "assemblyscript-json";
import { StakerHelper } from "./staker";
import { StakingPoolHelper } from "./staking_pool";
import { UserActionHelp } from "../user_action";
import { ConsumerChainHelper } from "./consumer_chain";
import { StakerAndConsumerChain, SubmittedUnstakeBatch, WithdrawAction } from "../../generated/schema";
import { StakerAndConsumerChainHelper } from "./staker_and_consumer_chain";
import { WithdrawalHelper } from "./withdrawal";
import { SummaryHelper } from "../summary";
import { SubmittedUnstakeBatchHelper } from "./unstake_batch";


export function handleRestakingBaseEvent(eventObj: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number, version: string): void {
	let objInData = (<JSON.Obj>eventObj.getArr("data")!.valueOf()[0])
	let event = eventObj.get("event")!.toString();

	if (event == "save_staking_pool") {
		handleSaveStakingPoolEvent(objInData, receipt, logIndex);
	} else if (event == "ping") {
		handlePingEvent(objInData, receipt, logIndex);
	} else if (event == "staker_stake") {
		handleStakerStakeEvent(objInData, receipt, logIndex);
	} else if (event == "staker_increase_stake") {
		handleIncreaseStakeEvent(objInData, receipt, logIndex);
	} else if (event == "staker_decrease_stake") {
		handleDecreaseStakeEvent(objInData, receipt, logIndex, version);
	} else if (event == "staker_unstake") {
		handleUnstakeEvent(objInData, receipt, logIndex, version);
	} else if (event == "staker_bond") {
		handleBondEvent(objInData, receipt, logIndex);
	} else if (event == "staker_unbond") {
		handleUnbondEvent(objInData, receipt, logIndex);
	} else if (event == "staker_change_key") {
		handleChangeKeyEvent(objInData, receipt, logIndex);
	} else if (event == "register_consumer_chain") {
		handleRegisterConsumerChainEvent(objInData, receipt, logIndex);
	} else if (event == "update_consumer_chain") {
		handleUpdateConsumerChainEvent(objInData, receipt, logIndex);
	} else if (event == "deregister_consumer_chain") {
		handleDeregisterConsumerChainEvent(objInData, receipt, logIndex);
	} else if (event == "request_slash") {
		handleRequestSlashEvent(objInData, receipt, logIndex);
	} else if (event == "withdraw") {
		handleWithdrawEvent(objInData, receipt, logIndex)
	} else if (event == "withdraw_unstake_batch") {
		handleWithdrawUnstakeBatchEvent(objInData, receipt, logIndex);
	} else if (event == "submit_unstake_batch") {
		handleSubmitUnstakeBatchEvent(objInData, receipt, logIndex);
	}
}

function handleSaveStakingPoolEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	let pool_id = data.getString("pool_id")!.valueOf();
	StakingPoolHelper.newStakingPool(pool_id)
}

function handlePingEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	// ValidatorHelper.updateStakedByPing(
	// 	data.getString("validator_id")!.valueOf(), 
	// 	BigInt.fromString(data.getString("new_total_staked_balance")!.valueOf())
	// )
	// StakerHelper.upda
	StakingPoolHelper.updateByPing(data)
	UserActionHelp.new_ping_action(data, receipt, logIndex)
	SummaryHelper.updateTotalStake()
}

function handleStakerStakeEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	StakingPoolHelper.updateByStakingPoolInfoJsonObj(data.getObj("staking_pool_info")!)
	StakerHelper.newOrUpdateByStakerInfo(data.getObj("staker_info")!)
	UserActionHelp.new_staker_stake_action(data, receipt, logIndex)
	let summary = SummaryHelper.updateTotalStake()
	summary.staker_count += 1
	summary.save()
}

function handleIncreaseStakeEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	StakingPoolHelper.updateByStakingPoolInfoJsonObj(data.getObj("staking_pool_info")!)
	StakerHelper.newOrUpdateByStakerInfo(data.getObj("staker_info")!)
	UserActionHelp.new_staker_increase_stake_action(data, receipt, logIndex)
	SummaryHelper.updateTotalStake()
}

function handleDecreaseStakeEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number, version: string): void {
	StakingPoolHelper.updateByStakingPoolInfoJsonObj(data.getObj("staking_pool_info")!)
	let staker = StakerHelper.newOrUpdateByStakerInfo(data.getObj("staker_info")!)
	let user_action = UserActionHelp.new_staker_decrease_stake_action(data, receipt, logIndex)
	WithdrawalHelper.newByPendingWithdrawalData(
		data.getObj("pending_withdrawal")!,
		staker.staker_id,
		user_action.id
	)
	SummaryHelper.updateTotalStake()
}

function handleUnstakeEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number, version: string): void {
	StakingPoolHelper.updateByStakingPoolInfoJsonObj(data.getObj("staking_pool_info")!)
	let staker = StakerHelper.newOrUpdateByStakerInfo(data.getObj("staker_info")!)
	StakerHelper.unstake(staker.staker_id)
	let user_action = UserActionHelp.new_staker_unstake_action(data, receipt, logIndex)
	WithdrawalHelper.newByPendingWithdrawalData(
		data.getObj("pending_withdrawal")!,
		staker.staker_id,
		user_action.id
	)
	let summary = SummaryHelper.updateTotalStake()
	summary.staker_count -= 1
	summary.save()
}

function handleBondEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	let staker_id = data.getString("staker_id")!.valueOf()
	let consumer_chain_id = data.getString("consumer_chain_id")!.valueOf()
	let key = data.getString("key")!.valueOf()
	StakerAndConsumerChainHelper.bond(staker_id, consumer_chain_id, key)

	StakerHelper.bond(staker_id, consumer_chain_id)

	UserActionHelp.new_staker_bond_action(data, receipt, logIndex)

}

function handleChangeKeyEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	let staker_id = data.getString("staker_id")!.valueOf()
	let consumer_chain_id = data.getString("consumer_chain_id")!.valueOf()
	let key = data.getString("key")!.valueOf()
	StakerAndConsumerChainHelper.change_key(staker_id, consumer_chain_id, key)

	UserActionHelp.new_staker_change_key_action(data, receipt, logIndex)
}

function handleUnbondEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	let staker_id = data.getString("staker_id")!.valueOf()
	let consumer_chain_id = data.getString("consumer_chain_id")!.valueOf()
	StakerAndConsumerChainHelper.unbond(staker_id, consumer_chain_id)

	StakerHelper.unbond(staker_id, consumer_chain_id)

	UserActionHelp.new_staker_unbond_action(data, receipt, logIndex)
}

function handleRegisterConsumerChainEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	ConsumerChainHelper.newOrUpdateByConsumerChainInfo(data.getObj("consumer_chain_info")!, false)
	UserActionHelp.new_register_consumer_chain_action(data, receipt, logIndex)
	let summary = SummaryHelper.getOrNew()
	summary.chain_count += 1
	summary.save()
}

function handleUpdateConsumerChainEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	let is_update_unbonding_period = UserActionHelp.new_update_consumer_chain_action(data, receipt, logIndex)
	ConsumerChainHelper.newOrUpdateByConsumerChainInfo(data.getObj("consumer_chain_info")!, is_update_unbonding_period)
}

function handleDeregisterConsumerChainEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	ConsumerChainHelper.newOrUpdateByConsumerChainInfo(data.getObj("consumer_chain_info")!, false)
	UserActionHelp.new_deregister_consumer_chain_action(data, receipt, logIndex)
	let summary = SummaryHelper.getOrNew()
	summary.chain_count -= 1
	summary.save()
}

function handleRequestSlashEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {

}

function handleWithdrawEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {

	let withdrawal_certificate = data.getString("withdraw_certificate") ?
		data.getString("withdraw_certificate")!.valueOf() :
		data.getString("withdrawal_certificate")!.valueOf()

	let user_action = UserActionHelp.new_withdraw_action(data, receipt, logIndex)
	WithdrawalHelper.withdraw(withdrawal_certificate, user_action.id)
}

function handleWithdrawUnstakeBatchEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {

	let user_action = UserActionHelp.new_withdraw_unstake_batch_action(data, receipt, logIndex)

	let unstake_batch_id = data.getString("unstake_batch_id")!.valueOf();
	let submitted_unstake_batch = SubmittedUnstakeBatch.load(unstake_batch_id)

	if (submitted_unstake_batch) {
		submitted_unstake_batch.is_withdrawn = true
		submitted_unstake_batch.withdraw_unstake_batch_action = user_action.id

		submitted_unstake_batch.save()
	}
}

function handleSubmitUnstakeBatchEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {

	if (data.getString("pool_id")) {
		let pool_id = data.getString("pool_id")!.valueOf()
		let submitted_unstake_batch = SubmittedUnstakeBatchHelper.newFromJsonData(data.getObj("submitted_unstake_batch")!, pool_id)
		let user_action = UserActionHelp.new_submit_unstake_batch_action(
			pool_id,
			submitted_unstake_batch.id,
			receipt,
			logIndex
		)
		submitted_unstake_batch.submit_unstake_batch_action = user_action.id
		submitted_unstake_batch.save()

	}




}