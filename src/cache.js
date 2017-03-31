export function makeCachedAttachmentLoader() {
  return (vk_bot, path) => {
    return vk_bot.uploadPhoto(path)
  }
}
