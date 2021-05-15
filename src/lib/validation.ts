const URL_REGEX = "https:\/\/([\w\.-]+\.)?pokernow.club\/(games)"

export function isValidPokerNowUrl(url: string) {
    return url && url.match(URL_REGEX);
}