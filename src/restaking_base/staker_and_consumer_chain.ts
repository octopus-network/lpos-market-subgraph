import { Staker, StakerAndConsumerChain, ValidatorAndConsumerChain } from "../../generated/schema";
import { store } from '@graphprotocol/graph-ts'



export class StakerAndConsumerChainHelper {

	static get_id(staker_id: string, consumer_chain_id: string): string {
		return `${staker_id}-${consumer_chain_id}`
	}

	static bond(staker_id: string, consumer_chain_id: string, key: string): void {
		let id = this.get_id(staker_id, consumer_chain_id)
		let stakerAndConsumerChain = StakerAndConsumerChain.load(id)
		if (!stakerAndConsumerChain) {
			stakerAndConsumerChain = new StakerAndConsumerChain(id)
		}
		stakerAndConsumerChain.staker = staker_id
		stakerAndConsumerChain.consumer_chain = consumer_chain_id
		stakerAndConsumerChain.key = key

		stakerAndConsumerChain.save()

		let staker = Staker.load(staker_id)!
		if (staker.validator) {
			let v_c_id = this.get_id(staker.validator!, consumer_chain_id)
			let validatorAndConsumerChain = ValidatorAndConsumerChain.load(v_c_id)
			if (!validatorAndConsumerChain) {
				validatorAndConsumerChain = new ValidatorAndConsumerChain(v_c_id)
			}
			validatorAndConsumerChain.validator = staker.validator!
			validatorAndConsumerChain.consumer_chain = consumer_chain_id
			validatorAndConsumerChain.key = key
			validatorAndConsumerChain.save()
		}

	}

	static unbond(staker_id: string, consumer_chain_id: string): void {
		let id = this.get_id(staker_id, consumer_chain_id)
		let staker = Staker.load(staker_id)!
		store.remove('StakerAndConsumerChain', id)

		if (staker.validator) {
			store.remove('ValidatorAndConsumerChain', this.get_id(staker.validator!, consumer_chain_id))
		}

	}

	static change_key(staker_id: string, consumer_chain_id: string, key: string): void {
		let id = this.get_id(staker_id, consumer_chain_id)
		let stakerAndConsumerChain = StakerAndConsumerChain.load(id)!

		stakerAndConsumerChain.staker = staker_id
		stakerAndConsumerChain.consumer_chain = consumer_chain_id
		stakerAndConsumerChain.key = key

		stakerAndConsumerChain.save()

		let staker = Staker.load(staker_id)!
		if (staker.validator) {
			let v_c_id = this.get_id(staker.validator!, consumer_chain_id)
			let validatorAndConsumerChain = ValidatorAndConsumerChain.load(v_c_id)!
			validatorAndConsumerChain.key = key
			validatorAndConsumerChain.save()
		}
	}
}