export default function makeCachedAttachmentLoader(cache) {
  return (vk_bot, path) => {
    return vk_bot.uploadPhoto(path)
  }
}
