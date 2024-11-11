import request from '@/api/request.js'


// 查询组织架构树
export function getOrgTree(param) {
  return request({
    url: 'oa/org/tree',
    method: 'get',
    params: param
  })
}

// 查询系统角色
export function getRole() {
  return request({
    url: 'oa/org/tree',
    method: 'get'
  })
}

// 搜索人员
export function getUserByName(param) {
  return request({
    url: 'oa/org/tree/user/search',
    method: 'get',
    params: param
  })
}

// 搜索人员
export function getUserDepts(userId) {
  return request({
    url: `oa/org/user/${userId}/dept`,
    method: 'get'
  })
}

export default {
  getOrgTree, getUserByName, getRole, getUserDepts
}
