export const result = (stdout = '', code = 0, stderr = '') => ({ stdout: String(stdout), stderr, code });
