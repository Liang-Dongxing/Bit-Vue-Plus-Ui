<template>
  <el-container class="LoginApp">
    <el-main>
      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
        <h3 class="title">{{ appTitle }}</h3>
        <el-form-item v-if="tenantEnabled" prop="tenantId">
          <el-select v-model="loginForm.tenantId" filterable placeholder="请选择/输入公司名称" style="width: 100%">
            <el-option
              v-for="item in tenantList"
              :key="item.tenantId"
              :label="item.companyName"
              :value="item.tenantId"></el-option>
            <template #prefix><svg-icon icon-class="company" class="el-input__icon input-icon" /></template>
          </el-select>
        </el-form-item>
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" type="text" size="large" auto-complete="off" placeholder="账号">
            <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            size="large"
            auto-complete="off"
            placeholder="密码"
            @keyup.enter="handleLogin">
            <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="captchaEnabled" prop="code">
          <el-row :gutter="20">
            <el-col :span="15">
              <el-input
                v-model="loginForm.code"
                size="large"
                auto-complete="off"
                placeholder="验证码"
                @keyup.enter="handleLogin">
                <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
              </el-input>
            </el-col>
            <el-col :span="9" class="login-code">
              <img :src="codeUrl" class="login-code-img" @click="getCode" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-col :span="12">
            <el-checkbox v-model="loginForm.rememberMe" style="width: 100%">记住密码</el-checkbox>
          </el-col>
          <el-col :span="12">
            <el-button circle @click="doSocialLogin('wechat')">
              <icon-park type="wechat" />
            </el-button>
            <el-button circle @click="doSocialLogin('maxkey')">
              <icon-park type="tencent-qq" />
            </el-button>
            <el-button circle @click="doSocialLogin('gitee')">
              <icon-park type="gitee" />
            </el-button>
            <el-button circle @click="doSocialLogin('github')">
              <icon-park type="github" />
            </el-button>
          </el-col>
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" type="primary" class="loading-button" @click.prevent="handleLogin">
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
        </el-form-item>
        <el-form-item v-if="register">
          <router-link class="router-link" :to="'/register'">立即注册</router-link>
        </el-form-item>
      </el-form>
    </el-main>
    <!--  底部  -->
    <el-footer>
      <GlobalFooter />
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { getCodeImg, getTenantList } from '@/api/login'
import { authBinding } from '@/api/system/social/auth'
import Cookies from 'js-cookie'
import { useUserStore } from '@/store/modules/user'
import { LoginData, TenantVO } from '@/api/types'
import { to } from 'await-to-js'
import { HttpStatus } from '@/enums/RespEnum'
import { useSettingsStore } from '@/store/modules/settings'

const userStore = useUserStore()
const router = useRouter()
const appTitle = useSettingsStore().appTitle

const loginForm = ref<LoginData>({
  tenantId: '000000',
  username: 'admin',
  password: 'admin123',
  rememberMe: false,
  code: '',
  uuid: '',
} as LoginData)

const loginRules: ElFormRules = {
  tenantId: [{ required: true, trigger: 'blur', message: '请输入您的租户编号' }],
  username: [{ required: true, trigger: 'blur', message: '请输入您的账号' }],
  password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
  code: [{ required: true, trigger: 'change', message: '请输入验证码' }],
}

const codeUrl = ref('')
const loading = ref(false)
// 验证码开关
const captchaEnabled = ref(true)
// 租户开关
const tenantEnabled = ref(true)

// 注册开关
const register = ref(true)
const redirect = ref(undefined)
const loginRef = ref<ElFormInstance>()
// 租户列表
const tenantList = ref<TenantVO[]>([])

const handleLogin = () => {
  loginRef.value?.validate(async (valid: boolean, fields: any) => {
    if (valid) {
      loading.value = true
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set('tenantId', String(loginForm.value.tenantId), { expires: 30 })
        Cookies.set('username', String(loginForm.value.username), { expires: 30 })
        Cookies.set('password', String(loginForm.value.password), { expires: 30 })
        Cookies.set('rememberMe', String(loginForm.value.rememberMe), { expires: 30 })
      } else {
        // 否则移除
        Cookies.remove('tenantId')
        Cookies.remove('username')
        Cookies.remove('password')
        Cookies.remove('rememberMe')
      }
      // 调用action的登录方法
      const [err] = await to(userStore.login(loginForm.value))
      if (!err) {
        await router.push({ path: redirect.value || '/' })
      } else {
        loading.value = false
        // 重新获取验证码
        if (captchaEnabled.value) {
          await getCode()
        }
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}

/**
 * 获取验证码
 */
const getCode = async () => {
  const res = await getCodeImg()
  const { data } = res
  captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled
  if (captchaEnabled.value) {
    codeUrl.value = 'data:image/gif;base64,' + data.img
    loginForm.value.uuid = data.uuid
  }
}

const getCookie = () => {
  const tenantId = Cookies.get('tenantId')
  const username = Cookies.get('username')
  const password = Cookies.get('password')
  const rememberMe = Cookies.get('rememberMe')
  loginForm.value = {
    tenantId: tenantId === undefined ? String(loginForm.value.tenantId) : tenantId,
    username: username === undefined ? String(loginForm.value.username) : username,
    password: password === undefined ? String(loginForm.value.password) : String(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
  } as LoginData
}

/**
 * 获取租户列表
 */
const initTenantList = async () => {
  const { data } = await getTenantList()
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled
  if (tenantEnabled.value) {
    tenantList.value = data.voList
    if (tenantList.value != null && tenantList.value.length !== 0) {
      loginForm.value.tenantId = tenantList.value[0].tenantId
    }
  }
}

//检测租户选择框的变化
watch(
  () => loginForm.value.tenantId,
  () => {
    Cookies.set('tenantId', String(loginForm.value.tenantId), { expires: 30 })
  }
)

/**
 * 第三方登录
 * @param type
 */
const doSocialLogin = (type: string) => {
  authBinding(type).then((res: any) => {
    if (res.code === HttpStatus.SUCCESS) {
      // 获取授权地址跳转
      window.location.href = res.data
    } else {
      ElMessage.error(res.msg)
    }
  })
}

onMounted(() => {
  getCode()
  initTenantList()
  getCookie()
})
</script>

<style lang="scss" scoped></style>
