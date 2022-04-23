import sleep from '../util/sleep';

export async function deleteMessage(message, seconds) {
    // Wait the given seconds before deleting the message
    await sleep(seconds);

    // Delete the message
    message.delete();
}
