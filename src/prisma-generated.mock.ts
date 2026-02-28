export class PrismaClient {}

export enum UserRole {
	superadmin = 'superadmin',
	admin = 'admin',
	worker = 'worker'
}

export enum ScheduleStatus {
	draft = 'draft',
	pending_approval = 'pending_approval',
	approved = 'approved',
	rejected = 'rejected'
}

export enum NotificationType {
	schedule_edit_by_admin = 'schedule_edit_by_admin',
	schedule_approval_request = 'schedule_approval_request',
	schedule_approved = 'schedule_approved',
	schedule_rejected = 'schedule_rejected',
	feed_post = 'feed_post',
	shift_handover = 'shift_handover'
}

export enum RouteSheetTimeSlotId {
	E8_11 = '8_11',
	E11_14 = '11_14',
	E14_17 = '14_17',
	E17_20 = '17_20'
}

export enum GoneGender {
	male = 'male',
	female = 'female',
	unknown = 'unknown'
}

export enum GoneReasonId {
	price = 'price',
	tour = 'tour',
	nonbuyer = 'nonbuyer',
	notfound = 'notfound',
	other = 'other'
}

export enum ScheduleApprovalStatus {
	pending = 'pending',
	approved = 'approved',
	rejected = 'rejected'
}

