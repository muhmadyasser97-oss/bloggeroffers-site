import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'



const supabaseUrl = 'https://mwtdflzkjlaynmrvlkpj.supabase.co'

const supabaseKey = 'sb_publishable_Y-qqdm5sqQQe7BzRv5G_XQ_c5ia1CNM'



const supabase = createClient(
  supabaseUrl,
  supabaseKey
)



const AMAZON_TAG = 'blogeroffe05-21'



const longUrlInput = document.getElementById('longUrl')

const resultBox = document.getElementById('result')

const linksTable = document.getElementById('linksTable')

const linksCount = document.getElementById('linksCount')

const clicksCount = document.getElementById('clicksCount')



let lastShortLink = ''



window.createShortLink = async function () {

  let url = longUrlInput.value.trim()

  if (!url) {
    alert('ضيف لينك')
    return
  }



  // فك أي لينك مختصر
  try {

    const response = await fetch(url, {
      method:'HEAD',
      redirect:'follow'
    })

    url = response.url

  } catch(e) {}



  // تنظيف لينكات أمازون
  if (url.includes('amazon.')) {

    // حذف tag المنافسين
    url = url.replace(/([?&])tag=[^&]*/g, '')

    // حذف ref
    url = url.replace(/([?&])ref=[^&]*/g, '')

    // حذف psc
    url = url.replace(/([?&])psc=[^&]*/g, '')

    // تنظيف الشكل
    url = url.replace('?&', '?')

    url = url.replace(/&&/g, '&')

    url = url.replace(/\?$/, '')



    // إضافة التاج بتاعك
    if (url.includes('?')) {
      url += '&tag=' + AMAZON_TAG
    } else {
      url += '?tag=' + AMAZON_TAG
    }

  }



  // إنشاء كود مختصر
  const code = Math
    .random()
    .toString(36)
    .substring(2,8)



  // حفظ في Supabase
  const { error } = await supabase
    .from('links')
    .insert([
      {
        code:code,
        original_url:url,
        clicks:0
      }
    ])



  if (error) {

    alert(error.message)

    return
  }



  // إنشاء اللينك المختصر
  lastShortLink =
    window.location.origin + '/' + code



  resultBox.innerHTML = lastShortLink



  loadLinks()
}



// نسخ آخر لينك
window.copyLastLink = async function () {

  if (!lastShortLink) {

    alert('اعملي لينك الأول')

    return
  }

  await navigator.clipboard.writeText(
    lastShortLink
  )

  alert('🔥 تم نسخ الرابط')
}



// تحميل اللينكات
async function loadLinks() {

  const { data } = await supabase
    .from('links')
    .select('*')
    .order('id', {
      ascending:false
    })



  linksTable.innerHTML = ''

  let totalClicks = 0



  data.forEach(link => {

    totalClicks += link.clicks



    const shortLink =
      window.location.origin +
      '/' +
      link.code



    linksTable.innerHTML += `

      <tr>

        <td>

          <a
            href="${shortLink}"
            target="_blank"
          >
            ${link.code}
          </a>

        </td>

        <td>
          ${link.clicks}
        </td>

        <td>

          <button
            onclick="copyText('${shortLink}')"
          >
            Copy
          </button>

        </td>

      </tr>

    `
  })



  linksCount.innerText = data.length

  clicksCount.innerText = totalClicks
}



// نسخ أي لينك
window.copyText = async function(text) {

  await navigator.clipboard.writeText(text)

  alert('🔥 تم النسخ')
}



// ريديركت اللينكات
async function checkRedirect() {

  const path =
    window.location.pathname.replace('/','')



  if (!path) return



  const { data } = await supabase
    .from('links')
    .select('*')
    .eq('code', path)
    .single()



  if (data) {

    // زيادة الكليكات
    await supabase
      .from('links')
      .update({
        clicks:data.clicks + 1
      })
      .eq('code', path)



    // تحويل للرابط الأصلي
    window.location.href =
      data.original_url
  }
}



checkRedirect()

loadLinks()
