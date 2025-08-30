import { CommandInteraction, Message, ThreadChannel } from "discord.js";
import { ThreadOptions } from "./ThreadOptions";

/**
 * Create new {@link ThreadChannel}.
 * @param origin - Origin interaction to create {@link ThreadChannel}
 * @param options - Options for create {@link ThreadChannel}
 * @returns {@link ThreadChannel} with provided options.
 * @alpha
 */
export async function create(origin: CommandInteraction, options: ThreadOptions): Promise<ThreadChannel> {
    // get origin message from interaction
    const originMessage: Message = await origin.fetchReply();
    // create thread for origin message
    return await originMessage.startThread(options);
}

/**
 * Destroy current {@link ThreadChannel}.
 * @param channel - {@link ThreadChannel} to destroy
 * @alpha
 */
export async function destroy(channel: ThreadChannel) {
    // I'm not sure if this even needed...
    await channel.delete();
}

/**
 * Check thread availability by changing properties.<br/>
 * It uses quite hacky method, so it might have issues.
 * @param channel - {@link ThreadChannel} to check availability
 * @returns Bot availability to target {@link ThreadChannel}.
 */
export async function validate(channel: ThreadChannel): Promise<boolean> {
    /**
     * Check thread availability by changing properties.
     * properties changed when check succeeds,
     * throws 'Missing Access' or 'Unknown Channel' error when the check failed.
     * This is a very hacky way; it might have lots of problems.
     */
    try {
        await channel.setInvitable(true);
        await channel.setInvitable(false);
        // check success; channel exists
        return true;
    } catch (err: any) {
        // check failed; channel exists but no permission
        if (err.message === 'Missing Access')
            return false;
        // check failed; channel not exists
        else if (err.message === 'Unknown Channel')
            return false;
        // exception; unknown error occurred
        else throw err;
    }
}