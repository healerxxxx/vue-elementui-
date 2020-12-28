/*
 * @Description: file content
 * @Company: Netease
 * @Author: lijida@corp.netease.com
 * @Date: 2020-05-11 16:39:55
 * @LastEditors: lijida
 * @LastEditTime: 2020-07-07 17:27:18
 */

export let lastSelectionRange

export function getCurrentRange () {
  let range
  if (document.selection && document.selection.createRange) {
    range = document.selection.createRange()
  } else if (window.getSelection && window.getSelection().rangeCount > 0) {
    range = window.getSelection().getRangeAt(0)
  }
  return range
}
export function saveSelection () {
  lastSelectionRange = getCurrentRange()
}
export function restoreSelection () {
  const selection = window.getSelection ? window.getSelection() : document.selection
  if (lastSelectionRange) {
    try {
      selection.removeAllRanges()
      selection.addRange(lastSelectionRange)
    } catch (ex) {
      const range = selection.createRange()
      range.setEndPoint('StartToStart', lastSelectionRange)
      range.select()
    }
  }
}
