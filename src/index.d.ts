/**
 * Like `node filename`, run file without watch.
 * @param filename - the file, usually ends with `.ts`
 */
export declare function esbuildRun(filename: string, args?: string[]): Promise<void>;
/**
 * Like `node-dev filename`, run file with watch and automatically restart.
 * @param filename - the file, usually ends with `.ts`
 */
export declare function esbuildDev(filename: string, args?: string[]): Promise<void>;
