
export interface NotificationEvent<K extends string | number | symbol, T> {

	type: string,
	data: Record<K, T>

}