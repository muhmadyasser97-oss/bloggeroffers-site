import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://mwtdflzkjlaynmrvlkpj.supabase.co'

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dGRmbHpramxheW5tcnZsa3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MTU5NzEsImV4cCI6MjA5Mzk5MTk3MX0.7xPnXS0Xxw4QqrDyrqiVsgI8h_mlK_qVp23gMsMVDnw'

const supabase = createClient(supabaseUrl, supabaseKey)

const AMAZON_TAG = 'blogeroffe05-21'

const authBox = document.getElementById('authBox')
const mainBox = document.getElementById('mainBox')

const signupBtn = document.getElementById('signupBtn')
const loginBtn = document.getElementById('loginBtn')

const createBtn = document.getElementById('createBtn')
const copyBtn = document.getElementById('copyBtn')

const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')

const urlInput = document.getElementById('urlInput')
const resultInput = document.getElementById('result')

const linksCount = document.getElementById('linksCount')
const clicksCount = document.getElementById('clicksCount')

const toast = document.getElementById('toast')

function showToast() {
  toast.style.display = 'block'

  setTimeout(() => {
    toast.style.display = 'none'
  }, 2000)
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8)
}

function cleanAmazonLink(url) {

  try {

    const parsed = new URL(url)

    if (!parsed.hostname.includes('amazon.')) {
      return url
    }

    const params = parsed.searchParams

    params.delete('tag')
    params.delete('ref')
    params.delete('psc')
    params.delete('smid')
    params.delete('pd_rd_w')
    params.delete('pd_rd_r')
    params.delete('pd_rd_wg')
    params.delete('pf_rd_p')
    params.delete('pf_rd_r')
    params.delete('linkCode')
    params.delete('ascsubtag')
    params.delete('content-id')
    params.delete('dib')
    params.delete('dib_tag')

    const cleanPath = parsed.pathname.replace(/[^/]*hidden-keywords[^/]*/gi, '')

    params.set('tag', AMAZON_TAG)

    return `${parsed.origin}${cleanPath}?${params.toString()}`

  } catch {

    return url

  }
}

signupBtn.onclick = async () => {

  const email = emailInput.value.trim()
  const password = passwordInput.value.trim()

  const { error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    alert(error.message)
    return
  }

  alert('تم إنشاء الحساب ✅')
}

loginBtn.onclick = async () => {

  const email = emailInput.value.trim()
  const password = passwordInput.value.trim()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    alert(error.message)
    return
  }

  authBox.classList.add('hidden')
  mainBox.classList.remove('hidden')

  loadStats()
}

async function loadStats() {

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return

  const { data } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user.id)

  if (!data) return

  linksCount.innerText = data.length

  let totalClicks = 0

  data.forEach(link => {
    totalClicks += link.clicks || 0
  })

  clicksCount.innerText = totalClicks
}

createBtn.onclick = async () => {

  const url = urlInput.value.trim()

  if (!url) {
    alert('حط لينك')
    return
  }

  const cleanUrl = cleanAmazonLink(url)

  const code = generateCode()

  const shortLink = `${window.location.origin}/${code}`

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('links')
    .insert({
      code,
      original_url: cleanUrl,
      clicks: 0,
      user_id: user.id
    })

  if (error) {
    alert(error.message)
    return
  }

  resultInput.value = shortLink

  loadStats()
}

copyBtn.onclick = () => {

  resultInput.select()

  document.execCommand('copy')

  showToast()
}

async function checkRedirect() {

  const path = window.location.pathname.replace('/', '')

  if (!path || path === 'index.html') return

  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('code', path)
    .single()

  if (error || !data) return

  await supabase
    .from('links')
    .update({
      clicks: (data.clicks || 0) + 1
    })
    .eq('id', data.id)

  window.location.href = data.original_url
}

async function checkUser() {

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (session) {

    authBox.classList.add('hidden')

    mainBox.classList.remove('hidden')

    loadStats()
  }
}

checkUser()
checkRedirect()
