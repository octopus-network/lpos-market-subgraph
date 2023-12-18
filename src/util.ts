import { BigInt, near } from "@graphprotocol/graph-ts";
import { UserAction } from "../generated/schema";
import { ActionId, action_types } from "./user_action";


export function convertStringToBigInt(U128: string): BigInt {
	return BigInt.fromString(U128)
}

export function user_action_id(action_type: action_types.ActionType ,  receipt_id: near.CryptoHash, log_id: number): ActionId {
    return `${receipt_id.toBase58()}-${log_id}-${action_type}`
}

export function new_user_action(action_type: action_types.ActionType ,  receipt: near.ReceiptWithOutcome, log_id: number): UserAction {
    let user_action = new UserAction(user_action_id(action_type, receipt.receipt.id, log_id))
    user_action.timestamp = BigInt.fromU64(receipt.block.header.timestampNanosec)
    user_action.timestamp_plus_log_index = user_action.timestamp.plus(BigInt.fromU64(log_id as u64))
    user_action.predecessor_id = receipt.receipt.predecessorId
    user_action.signer_id = receipt.receipt.signerId
    user_action.user_id = receipt.receipt.signerId
    user_action.receipt_id = receipt.receipt.id.toBase58()
    user_action.action_type = action_type

    return user_action
}

export function staked_balance_from_shares(
	total_staked_balance: BigInt, 
	total_share_balance: BigInt,
	share_balance: BigInt
): BigInt {

	if(total_share_balance.equals(BigInt.zero())) {
		return BigInt.zero()
	}

	return (total_staked_balance.times(share_balance).div(total_share_balance)) 
}

export function remove_s_at_array(array: string[], rm: string): string[] {
    let after_rm: string[] = []
    for(let i = 0 ;i<array.length;i++) {
        if(array[i] != rm) {
            after_rm.push(array[i])
        }
    }
    return after_rm
}