/** Значения из .env — строки; нельзя писать Boolean(x): Boolean('false') === true */
export function parseEnvBool(raw: string): boolean {
	const v = raw.trim().toLowerCase()
	return v === 'true' || v === '1' || v === 'yes'
}
