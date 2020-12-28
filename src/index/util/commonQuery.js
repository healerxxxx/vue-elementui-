import { CommonApi, QuizDetail, ExpertDetail, MatchDetail } from './api'
import service from './service'

export const uploadImg = (file, type, check) => {
  let url = {}
  check ? (url = CommonApi.uploadImgUncheck) : (url = CommonApi.uploadImg)
  let formData = new FormData()
  formData.append('0', file)
  return service(url, {
    urlParams: {
      serviceType: type
    },
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  }).then(
    res => {
      if (res.code === 200) {
        return Promise.resolve(res.data[0].sourceUrl)
      } else {
        return Promise.reject(res.message)
      }
    },
    err => {
      return Promise.reject(JSON.stringify(err))
    }
  )
}

export const queryQuizDetailbyId = id => {
  return service(QuizDetail.query, {
    urlParams: {
      threadId: id
    }
  }).then(
    res => {
      if (res.code === 200) {
        return Promise.resolve(res.data)
      } else {
        return Promise.reject(res.message)
      }
    },
    err => {
      return Promise.reject(JSON.stringify(err))
    }
  )
}

export const queryExpertDetailbyId = id => {
  return service(ExpertDetail.info, {
    urlParams: {
      userId: id
    }
  }).then(
    res => {
      if (res.code === 200) {
        return Promise.resolve(res.data)
      } else {
        return Promise.reject(res.message)
      }
    },
    err => {
      return Promise.reject(JSON.stringify(err))
    }
  )
}

export const queryMatchDetailbyId = id => {
  return service(MatchDetail.info, {
    urlParams: {
      matchInfoId: id
    }
  }).then(
    res => {
      if (res.code === 200) {
        return Promise.resolve(res.data)
      } else {
        return Promise.reject(res.message)
      }
    },
    err => {
      return Promise.reject(JSON.stringify(err))
    }
  )
}

export const queryCouponById = id => {
  return service(CommonApi.couponSimpleInfoById, {
    urlParams: {
      couponId: id
    }
  }).then(
    res => {
      if (res.code === 200) {
        return Promise.resolve(res.data)
      } else {
        return Promise.reject(res.message)
      }
    },
    err => {
      return Promise.reject(JSON.stringify(err))
    }
  )
}

export const queryPointCardById = id => {
  return service(CommonApi.poindCardInfoById, {
    params: {
      pointCardId: id
    }
  }).then(
    res => {
      if (res.code === 200) {
        return Promise.resolve(res.data)
      } else {
        return Promise.reject(res.message)
      }
    },
    err => {
      return Promise.reject(JSON.stringify(err))
    }
  )
}
