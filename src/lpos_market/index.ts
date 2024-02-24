import { BigInt, near } from "@graphprotocol/graph-ts";
import { JSON } from "assemblyscript-json";
import { SummaryHelper } from "../summary";
import { UserActionHelp } from "../user_action";
import { DelegatorHelper } from "./delegator";
import { RewardHelper } from "./reward";
import { ValidatorHelper } from "./validator";


export function handleLposMarketEvent(eventObj: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number, version: string): void {
	let objInData = (<JSON.Obj>eventObj.getArr("data")!.valueOf()[0])
	let event = eventObj.get("event")!.toString();

	if (event == "ping") {
		handlePingEvent(objInData, receipt, logIndex);
	} else if (event == "deploy") {
		handleDeployEvent(objInData, receipt, logIndex);
	} else if (event == "stake") {
		handleStakeEvent(objInData, receipt, logIndex);
	} else if (event == "increase_stake") {
		handleIncreaseStakeEvent(objInData, receipt, logIndex);
	} else if (event == "decrease_stake") {
		handleDecreaseStakeEvent(objInData, receipt, logIndex);
	} else if (event == "unstake") {
		handleUnstakeEvent(objInData, receipt, logIndex);
	} else if (event == "withdraw_in_unstake") {
		handleWithdrawInUnstakeEvent(objInData, receipt, logIndex);
	} else if (event == "destroy") {
		handelDestroyEvent(objInData, receipt, logIndex)
	} else if (event == "delegate") {
		handleDelegateEvent(objInData, receipt, logIndex);
	} else if (event == "increase_delegation" || event == "increase_delegate") {
		handleIncreaseDelegationEvent(objInData, receipt, logIndex);
	} else if (event == "decrease_delegation" || event == "decrease_delegate") {
		handleDecreaseDelegationEvent(objInData, receipt, logIndex);
	} else if (event == "undelegate") {
		handleUndelegateEvent(objInData, receipt, logIndex);
	} else if (event == "undelegate_in_unstake") {
		handleUndelegateInUnstakeEvent(objInData, receipt, logIndex);
	} else if (event == "delegator_receive_reward") {
		handleDelegatorReceiveRewardEvent(objInData, receipt, logIndex);
	} else if (event == "validator_receive_reward") {
		handleValidatorReceiveRewardEvent(objInData, receipt, logIndex)
	} else if (event == "octopus_receive_reward") {
		handleOctopusReceiveRewardEvent(objInData, receipt, logIndex)
	} else if (event == "delegator_claim_reward") {
		handleDelegatorClaimRewardEvent(objInData, receipt, logIndex)
	} else if (event == "validator_claim_reward") {
		handleValidatorClaimRewardEvent(objInData, receipt, logIndex)
	} else if (event == "restake") {
		handleRestakeEvent(objInData, receipt, logIndex)
	}  else if (event == "unrestake") {
		handleUnrestakeEvent(objInData, receipt, logIndex)
	}  else if (event == "change_key") {
		handleChangeKeyEvent(objInData, receipt, logIndex)
	} else if (event == "receive_anchor_reward") {
		handleReceiveAnchorRewardEvent(objInData, receipt, logIndex)
	} else if (event == "validator_receive_anchor_reward") {
		handleValidatorReceiveAnchorRewardEvent(objInData, receipt, logIndex)
	} 
}



function handlePingEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	ValidatorHelper.updateStakedByPing(
		data.getString("validator_id")!.valueOf(),
		BigInt.fromString(data.getString("new_total_staked_balance")!.valueOf())
	)
	UserActionHelp.new_validator_ping_action(data, receipt, logIndex)
	SummaryHelper.updateTotalStake()
}

/**
 *  {
 * 		"validator": ValidatorInfo
 * 	}
 * 
 * @param data 
 * @param receipt 
 * @param logIndex 
 */
function handleDeployEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	ValidatorHelper.newOrUpdateByValidatorInfo(data.getObj("validator_info")!)
	UserActionHelp.new_deploy_action(data, receipt, logIndex)
	let summary = SummaryHelper.getOrNew()
	summary.all_validator_count += 1
	summary.save()
}

/**
 * {
 * 	"validator_info": ValidatorInfo,
 * 	"stake_amount": U128,
 * 	"increase_shares": U128
 * }
 * @param data 
 * @param receipt 
 * @param logIndex 
 */
function handleStakeEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	let validator = ValidatorHelper.stake(data.getObj("validator_info")!)
	UserActionHelp.new_stake_action(data, receipt, logIndex, validator.validator_id)

	SummaryHelper.stake(validator.validator_id);
	SummaryHelper.updateTotalStake()

}

/**
 * {
 * 	"validator_info": ValidatorInfo,
 * 	"increase_stake_amount": U128,
 * 	"increase_shares": U128,
 * }
 * @param data 
 * @param receipt 
 * @param logIndex 
 */
function handleIncreaseStakeEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	let validator = ValidatorHelper.newOrUpdateByValidatorInfo(data.getObj("validator_info")!)
	UserActionHelp.new_increase_stake_action(data, receipt, logIndex, validator.validator_id)
	SummaryHelper.updateTotalStake()
}

/**
 * {
 * 	"validator_info": ValidatorInfo,
 * 	"decrease_stake_amount": U128,
 * 	"decrease_shares": U128
 * }
 * @param data 
 * @param receipt 
 * @param logIndex 
 */
function handleDecreaseStakeEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	let validator = ValidatorHelper.newOrUpdateByValidatorInfo(data.getObj("validator_info")!)
	UserActionHelp.new_decrease_stake_action(data, receipt, logIndex, validator.validator_id)
	SummaryHelper.updateTotalStake()
}

function handleUnstakeEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	let validator_id = data.getObj("validator_info")!.getString("validator_id")!.valueOf()
	let validator = ValidatorHelper.newOrUpdateByValidatorInfo(data.getObj("validator_info")!)
	UserActionHelp.new_unstake_action(data, receipt, logIndex, validator_id);

	SummaryHelper.unstake(validator_id)
	SummaryHelper.updateTotalStake()
}

function handleWithdrawInUnstakeEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	let validator = ValidatorHelper.newOrUpdateByValidatorInfo(data.getObj("validator_info")!)
	// UserActionHelp.new_with(data, receipt, logIndex, validator.validator_id);
	UserActionHelp.new_withdraw_unstake_action(data, receipt, logIndex, validator.validator_id, validator.unstake_withdraw_certificate!)
}

function handelDestroyEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	let validator_id = data.getString("validator_id")!.valueOf();
	ValidatorHelper.destroy(validator_id)
	UserActionHelp.new_destroy_action(data, receipt, logIndex, validator_id)

	let summary = SummaryHelper.getOrNew()
	summary.all_validator_count -= 1
	summary.save()
}

function handleDelegateEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	let validator = ValidatorHelper.newOrUpdateByValidatorInfo(data.getObj("validator_info")!)
	let delegator = DelegatorHelper.newOrUpdateByDelegatorInfo(data.getObj("delegator_info")!)
	UserActionHelp.new_delegate_action(
		data, 
		receipt, 
		logIndex, 
		validator.validator_id,
		delegator
	)

	ValidatorHelper.delegate(validator.id, data.getObj("delegator_info")!.getString("delegator_id")!.valueOf())
	let summary = SummaryHelper.getOrNew()
	summary.delegator_count += 1
	summary.save()

	SummaryHelper.updateTotalStake()
}

function handleIncreaseDelegationEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	let validator = ValidatorHelper.newOrUpdateByValidatorInfo(data.getObj("validator_info")!)
	let delegator = DelegatorHelper.newOrUpdateByDelegatorInfo(data.getObj("delegator_info")!)
	UserActionHelp.new_increase_delegation_action(data, receipt, logIndex, validator.validator_id, delegator)

	SummaryHelper.updateTotalStake()
}

function handleDecreaseDelegationEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	let validator = ValidatorHelper.newOrUpdateByValidatorInfo(data.getObj("validator_info")!)
	let delegator = DelegatorHelper.newOrUpdateByDelegatorInfo(data.getObj("delegator_info")!)
	UserActionHelp.new_decrease_delegation_action(data, receipt, logIndex, validator.validator_id, delegator)
	SummaryHelper.updateTotalStake()
}

function handleUndelegateEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	let validator = ValidatorHelper.newOrUpdateByValidatorInfo(data.getObj("validator_info")!)
	DelegatorHelper.newOrUpdateByDelegatorInfo(data.getObj("delegator_info")!)
	UserActionHelp.new_undelegate_action(data, receipt, logIndex, validator.validator_id)
	ValidatorHelper.undelegate(
		data.getObj("validator_info")!.getString("validator_id")!.valueOf(),
		data.getObj("delegator_info")!.getString("delegator_id")!.valueOf()
	)

	let summary = SummaryHelper.getOrNew()
	summary.delegator_count -= 1
	summary.save()
	SummaryHelper.updateTotalStake()
}

function handleUndelegateInUnstakeEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	let validator = ValidatorHelper.newOrUpdateByValidatorInfo(data.getObj("validator_info")!)
	let delegator = DelegatorHelper.newOrUpdateByDelegatorInfo(data.getObj("delegator_info")!)
	UserActionHelp.new_undelegate_in_unstake_action(
		data,
		receipt,
		logIndex,
		delegator.delegator_id,
		validator.validator_id
	)

	ValidatorHelper.undelegate(
		validator.validator_id, delegator.delegator_id
	)

	let summary = SummaryHelper.getOrNew()
	summary.delegator_count -= 1
	summary.save()

}

function handleDelegatorReceiveRewardEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	UserActionHelp.new_delegator_receive_reward_action(data, receipt, logIndex)
	let delegator_id = data.getString("delegator_id")!.valueOf()
	let reward_token_id = data.getString("reward_token_id")!.valueOf()
	let reward_token_amount = BigInt.fromString(data.getString("reward_token_amount")!.valueOf())
	RewardHelper.delegatorReceiveReward(delegator_id, reward_token_id, reward_token_amount)
}

function handleValidatorReceiveRewardEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {

	if (!data.getString("reward_token_id") || !data.getString("reward_token_amount")) {
		return
	}

	let validator_id = data.getString("validator_id")!.valueOf()
	let reward_token_id = data.getString("reward_token_id")!.valueOf()
	let reward_token_amount = BigInt.fromString(data.getString("reward_token_amount")!.valueOf())

	RewardHelper.validatorReceiveReward(validator_id, reward_token_id, reward_token_amount)
	UserActionHelp.new_validator_receive_reward_action(data, receipt, logIndex)
}

function handleOctopusReceiveRewardEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	UserActionHelp.new_octopus_receive_reward_action(data, receipt, logIndex)
}

function handleDelegatorClaimRewardEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	UserActionHelp.new_delegator_claim_reward_action(data, receipt, logIndex)
	let delegator_id = data.getString("delegator_id")!.valueOf()
	let reward_token_id = data.getString("reward_token_id")!.valueOf()
	let reward_token_amount = BigInt.fromString(data.getString("reward_token_amount")!.valueOf())
	RewardHelper.delegatorClaimReward(delegator_id, reward_token_id, reward_token_amount)
}

function handleValidatorClaimRewardEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	UserActionHelp.new_validator_claim_reward_action(data, receipt, logIndex)

	let validator_id = data.getString("validator_id")!.valueOf()
	let reward_token_id = data.getString("reward_token_id")!.valueOf()
	let reward_token_amount = BigInt.fromString(data.getString("reward_token_amount")!.valueOf())
	RewardHelper.validatorClaimReward(validator_id, reward_token_id, reward_token_amount)

}

function handleRestakeEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	UserActionHelp.new_restake_action(data, receipt, logIndex)
	let validator_id = data.getString("validator_id")!.valueOf()
	let consumer_chain_id = data.getString("consumer_chain_id")!.valueOf()
	let key = data.getString("key")!.valueOf()
	// ValidatorHelper.restake(validator_id, consumer_chain_id, key)
}

function handleUnrestakeEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	UserActionHelp.new_unrestake_action(data, receipt, logIndex)
	let validator_id = data.getString("validator_id")!.valueOf()
	let consumer_chain_id = data.getString("consumer_chain_id")!.valueOf()
	// ValidatorHelper.unrestake(validator_id, consumer_chain_id)
}

function handleChangeKeyEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	UserActionHelp.new_change_key_action(data, receipt, logIndex)
	let validator_id = data.getString("validator_id")!.valueOf()
	let consumer_chain_id = data.getString("consumer_chain_id")!.valueOf()
	let key = data.getString("key")!.valueOf()
	// ValidatorHelper.change_key(validator_id, consumer_chain_id, key)
}

function handleReceiveAnchorRewardEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	UserActionHelp.new_receive_anchor_reward_action(data, receipt, logIndex)
}

function handleValidatorReceiveAnchorRewardEvent(data: JSON.Obj, receipt: near.ReceiptWithOutcome, logIndex: number): void {
	UserActionHelp.new_validator_receive_anchor_reward_action(data, receipt, logIndex)
}