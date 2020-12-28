import commonApi from './api/common'
import service from './service'

export const uploadImg = (file, type) => {
  let formData = new FormData()
  formData.append('0', file)
  return service(commonApi.uploadImg, {
    urlParams: {
      serviceType: type
    },
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  }).then(res => {
    if (res.code === 200) {
      return Promise.resolve(res.data[0].sourceUrl)
    } else {
      return Promise.reject(res.message)
    }
  }, err => {
    return Promise.reject(JSON.stringify(err))
  })
}
