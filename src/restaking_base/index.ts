import { near } from "@graphprotocol/graph-ts";
import { JSON } from "assemblyscript-json";
import { StakerHelper } from "./staker";
import { StakingPoolHelper } from "./staking_pool";
import { UserActionHelp } from "../user_action";
import { ConsumerChainHelper } from "./consumer_chain";
import { StakerAndConsumerChain } from "../../generated/schema";
import { StakerAndConsumerChainHelper } from "./staker_and_consumer_chain";


export function handleRestakingBaseEvent(eventObj: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
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
		handleDecreaseStakeEvent(objInData, receipt, logIndex);
	} else if (event == "staker_unstake") {
		handleUnstakeEvent(objInData, receipt, logIndex);
	} else if (event =="staker_bond") {
		handleBondEvent(objInData, receipt, logIndex);
	} else if (event =="staker_unbond") {
		handleUnbondEvent(objInData, receipt, logIndex);
	} else if (event =="staker_change_key") {
		handleChangeKeyEvent(objInData, receipt, logIndex);
	} else if (event == "register_consumer_chain") {
		handleRegisterConsumerChainEvent(objInData, receipt, logIndex);
	} else if (event == "update_consumer_chain") {
		handleUpdateConsumerChainEvent(objInData, receipt, logIndex);
	} else if (event == "deregister_consumer_chain") {
		handleDeregisterConsumerChainEvent(objInData, receipt, logIndex);
	} else if (event == "request_slash") {
		handleRequestSlashEvent(objInData, receipt, logIndex);
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
	UserActionHelp.new_ping_action(data, receipt, logIndex)
}

function handleStakerStakeEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	StakingPoolHelper.updateByStakingPoolInfoJsonObj(data.getObj("staking_pool_info")!)
	StakerHelper.newOrUpdateByStakerInfo(data.getObj("staker_info")!)
	UserActionHelp.new_staker_stake_action(data, receipt, logIndex)
}

function handleIncreaseStakeEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	StakingPoolHelper.updateByStakingPoolInfoJsonObj(data.getObj("staking_pool_info")!)
	StakerHelper.newOrUpdateByStakerInfo(data.getObj("staker_info")!)
	UserActionHelp.new_staker_increase_stake_action(data, receipt, logIndex)
}

function handleDecreaseStakeEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	StakingPoolHelper.updateByStakingPoolInfoJsonObj(data.getObj("staking_pool_info")!)
	StakerHelper.newOrUpdateByStakerInfo(data.getObj("staker_info")!)
	UserActionHelp.new_staker_decrease_stake_action(data, receipt, logIndex)
}

function handleUnstakeEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	StakingPoolHelper.updateByStakingPoolInfoJsonObj(data.getObj("staking_pool_info")!)
	StakerHelper.newOrUpdateByStakerInfo(data.getObj("staker_info")!)
	UserActionHelp.new_staker_unstake_action(data, receipt, logIndex)
}

function handleBondEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	let staker_id = data.getString("staker_id")!.valueOf()
	let consumer_chain_id = data.getString("consumer_chain_id")!.valueOf()
	let key = data.getString("key")!.valueOf()
	StakerAndConsumerChainHelper.bond(staker_id, consumer_chain_id, key)

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

	UserActionHelp.new_staker_unbond_action(data, receipt, logIndex)
}

function handleRegisterConsumerChainEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	ConsumerChainHelper.newOrUpdateByConsumerChainInfo(data.getObj("consumer_chain_info")!)
	UserActionHelp.new_register_consumer_chain_action(data, receipt, logIndex)
}

function handleUpdateConsumerChainEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	ConsumerChainHelper.newOrUpdateByConsumerChainInfo(data.getObj("consumer_chain_info")!)
	UserActionHelp.new_update_consumer_chain_action(data, receipt, logIndex)
}

function handleDeregisterConsumerChainEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	ConsumerChainHelper.newOrUpdateByConsumerChainInfo(data.getObj("consumer_chain_info")!)
	UserActionHelp.new_deregister_consumer_chain_action(data, receipt, logIndex)
}

function handleRequestSlashEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {

}
