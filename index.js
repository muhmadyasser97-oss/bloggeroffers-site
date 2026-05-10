import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://mwtdflzkjlaynmrvlkpj.supabase.co'

const supabaseKey = 'sb_publishable_Y-qqdm5sqQQe7BzRv5G_XQ_c5ia1CNM'

const supabase = createClient(supabaseUrl, supabaseKey)

const AMAZON_TAG = 'blogeroffe05-21'

const authBox = document.getElementById('authBox')
const mainBox = document.getElementById('mainBox')

const signupBtn = document.getElementById('signupBtn')
const loginBtn = document.getElementById('loginBtn')

const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')

const longUrlInput = document.getElementById('longUrl')
const resultBox = document.getElementById('result')

signupBtn.onclick = async () => {

  const email = emailInput.value
  const password = passwordInput.value

  const { error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    alert(error.message)
  } else {
    alert('🔥 تم إنشاء الحساب')
  }
}

loginBtn.onclick = async () => {

  const email = emailInput.value
  const password = passwordInput.value

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    alert(error.message)
  } else {

    authBox.style.display = 'none'
    mainBox.style.display = 'block'

    alert('🔥 تم تسجيل الدخول')
  }
}

async function createShortLink() {

  let url = longUrlInput.value.trim()

  if (!url) {
    alert('ضيفي لينك')
    return
  }

  if (url.includes('amazon')) {

    if (url.includes('?')) {
      url += `&tag=${AMAZON_TAG}`
    } else {
      url += `?tag=${AMAZON_TAG}`
    }
  }

  const code = Math.random().toString(36).substring(2, 8)

  const userData = await supabase.auth.getUser()

  const user = userData.data.user

  const { error } = await supabase
    .from('links')
    .insert([
      {
        code: code,
        original_url: url,
        clicks: 0,
        user_id: user?.id
      }
    ])

  if (error) {
    alert(error.message)
    return
  }

  const shortUrl = window.location.origin + '/' + code

  resultBox.innerHTML = `
    <div style="margin-top:20px">
      <input 
        value="${shortUrl}" 
        readonly
        style="
          width:100%;
          padding:12px;
          border-radius:10px;
          border:none;
          margin-bottom:10px;
        "
      >

      <button onclick="copyLink('${shortUrl}')"
        style="
          width:100%;
          padding:12px;
          border:none;
          border-radius:10px;
          background:#ff4d6d;
          color:white;
          font-size:16px;
          cursor:pointer;
        ">
        نسخ الرابط 🔥
      </button>
    </div>
  `
}

window.createShortLink = createShortLink

window.copyLink = async function(link) {

  await navigator.clipboard.writeText(link)

  alert('🔥 تم نسخ الرابط')
}

async function checkRedirect() {

  const path = window.location.pathname.replace('/', '')

  if (!path) return

  const { data } = await supabase
    .from('links')
    .select('*')
    .eq('code', path)
    .single()

  if (data) {

    await supabase
      .from('links')
      .update({
        clicks: data.clicks + 1
      })
      .eq('code', path)

    window.location.href = data.original_url
  }
}

checkRedirect()
