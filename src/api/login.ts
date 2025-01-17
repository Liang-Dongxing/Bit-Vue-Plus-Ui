import request from '@/utils/request'
import { AxiosPromise } from 'axios'
import { LoginData, LoginResult, VerifyCodeResult, TenantInfo } from './types'
import { UserInfo } from '@/api/system/user/types'

// pc端固定客户端授权id
const clientId = 'e5cd7e4891bf95d1d19206ce24a7b32e'

/**
 * @param data {LoginData}
 * @returns
 */
export function login(data: LoginData): AxiosPromise<LoginResult> {
  const params = {
    ...data,
    clientId: data.clientId || clientId,
    grantType: data.grantType || 'password',
  }
  return request({
    url: '/auth/login',
    headers: {
      isToken: false,
      isEncrypt: true,
    },
    method: 'post',
    data: params,
  })
}

// 注册方法
export function register(data: any) {
  return request({
    url: '/auth/register',
    headers: {
      isToken: false,
    },
    method: 'post',
    data: data,
  })
}

/**
 * 注销
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post',
  })
}

/**
 * 获取验证码
 */
export function getCodeImg(): AxiosPromise<VerifyCodeResult> {
  return request({
    url: '/code',
    headers: {
      isToken: false,
    },
    method: 'get',
    timeout: 20000,
  })
}

/**
 * 第三方登录
 */
export function callback(data: LoginData): AxiosPromise<any> {
  const LoginData = {
    ...data,
    clientId: clientId,
    grantType: 'social',
  }
  return request({
    url: '/auth/social/callback',
    method: 'post',
    data: LoginData,
  })
}

// 获取用户详细信息
export function getInfo(): AxiosPromise<UserInfo> {
  return request({
    url: '/system/user/getInfo',
    method: 'get',
  })
}

// 获取租户列表
export function getTenantList(): AxiosPromise<TenantInfo> {
  return request({
    url: '/auth/tenant/list',
    headers: {
      isToken: false,
    },
    method: 'get',
  })
}
