import { BigInt } from "@graphprotocol/graph-ts";
import { Sponsor, SponsorAndConsumerChain, UnsponsorRecord } from "../../generated/schema";
import { store } from '@graphprotocol/graph-ts'
import { user_action_id } from "../util";

export class SponsorHelper {

	static sponsor_and_cc_id(sponsor_id: string, consumer_chain_id: string): string {
		return sponsor_id+"#"+consumer_chain_id
	}

	static sponsor(sponsor_id: string, sponsor_amount: BigInt, consumer_chain_id: string): void {
		let sponsor = Sponsor.load(sponsor_id)
		if(!sponsor) {
			sponsor = new Sponsor(sponsor_id)
			sponsor.sponsor_consumer_chain_count = 0
			sponsor.total_sponsor_amount = BigInt.zero()
		}
		sponsor.total_sponsor_amount = sponsor.total_sponsor_amount.plus(sponsor_amount)
		sponsor.sponsor_consumer_chain_count = sponsor.sponsor_consumer_chain_count+1 
		sponsor.save()

		
		let sponsor_and_cc_id = this.sponsor_and_cc_id(sponsor_id, consumer_chain_id)
		let sponsor_and_cc = SponsorAndConsumerChain.load(sponsor_and_cc_id)
		if(!sponsor_and_cc) {
			sponsor_and_cc = new SponsorAndConsumerChain(sponsor_and_cc_id)
			sponsor_and_cc.sponsor = sponsor_id
			sponsor_and_cc.consumer_chain = consumer_chain_id
		}
		sponsor_and_cc.is_sponsoring = true
		sponsor_and_cc.sponsor_amount = sponsor_amount
		sponsor_and_cc.save()
	}

	static increase_sponsorship(sponsor_id: string, sponsor_amount: BigInt, consumer_chain_id: string): void {
		let sponsor = Sponsor.load(sponsor_id)!
		sponsor.total_sponsor_amount = sponsor.total_sponsor_amount.plus(sponsor_amount)
		sponsor.save()

		let sponsor_and_cc_id = this.sponsor_and_cc_id(sponsor_id, consumer_chain_id)
		let sponsor_and_cc = SponsorAndConsumerChain.load(sponsor_and_cc_id)!
		sponsor_and_cc.sponsor_amount = sponsor_and_cc.sponsor_amount.plus(sponsor_amount)
		sponsor_and_cc.save()
	} 

	static decrease_sponsorship(
		sponsor_id: string, 
		sponsor_amount: BigInt, 
		consumer_chain_id: string
	):void {
		let sponsor = Sponsor.load(sponsor_id)!
		sponsor.total_sponsor_amount = sponsor.total_sponsor_amount.minus(sponsor_amount)
		sponsor.save()

		let sponsor_and_cc_id = this.sponsor_and_cc_id(sponsor_id, consumer_chain_id)
		let sponsor_and_cc = SponsorAndConsumerChain.load(sponsor_and_cc_id)!
		sponsor_and_cc.sponsor_amount = sponsor_and_cc.sponsor_amount.minus(sponsor_amount)
		sponsor_and_cc.save()
	}

	static unsponsor(sponsor_id: string, sponsor_amount: BigInt, consumer_chain_id: string):void {
		let sponsor = Sponsor.load(sponsor_id)!
		sponsor.total_sponsor_amount = sponsor.total_sponsor_amount.minus(sponsor_amount)
		sponsor.save()

		let sponsor_and_cc_id = this.sponsor_and_cc_id(sponsor_id, consumer_chain_id)

		store.remove('SponsorAndConsumerChain', sponsor_and_cc_id)
	}

	static unsponsor_record(
		sponsor_id: string, 
		amount: BigInt, 
		consumer_chain_id: string, 
		unsponsor_record_id: string,
		unlock_time: BigInt,
		user_action_id: string,
	): UnsponsorRecord {
		let unsponsor_record = new UnsponsorRecord(unsponsor_record_id)
		unsponsor_record.sponsor_id = sponsor_id
		unsponsor_record.sponsor = sponsor_id
		unsponsor_record.consumer_chain_id = consumer_chain_id
		unsponsor_record.amount = amount
		unsponsor_record.unlock_time = unlock_time
		unsponsor_record.is_withdraw = false
		unsponsor_record.create_action = user_action_id
		unsponsor_record.save()
		return unsponsor_record
	}

	static withdraw_unsponsor(
		unsponsor_record_id: string,
		withdraw_action: string
	):void {
		let unsponsor_record = new UnsponsorRecord(unsponsor_record_id)
		unsponsor_record.withdraw_action = withdraw_action
		unsponsor_record.is_withdraw = true
		unsponsor_record.save()
	}

}