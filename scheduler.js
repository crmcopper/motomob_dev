const { NOTIFICATION_FETCH_LIMIT } = require("./util/config")
const User = require("./models/User")
const Notification = require("./models/Notification")
const mail = require("./util/mail")
const moment = require("moment")
const { log } = require("./util/logger")
var moment = require("moment")

async function sendMail(notification, email, userId) {
  let allData = ""
  allData +=
    "<table cellpadding='0' cellspacing='0' border='0' width='100%' style='border-collapse:collapse;background-color: #F8FAFC;border:none;'> <tr> <td style='padding:15px;'> <center style='width: 100%;'><table cellspacing='0' cellpadding='0' border='0' style='border-collapse:collapse;background-color: #fff;border: 1px solid #EFF5F8;border-radius: 5px;' bgcolor='#ffffff' align='center' width='650' class='email-container'> <tr> <td style='padding:15px;'><table cellspacing='0' cellpadding='0' border='0' width='100%' class='email-container'>"
  allData += `<tr><td align='left' style='text-align: left; padding-bottom: 5px; font-family:Roboto, sans-serif; font-size:20px; mso-height-rule: exactly; line-height:22px; color: #404040;font-weight: 700;'>Hello <span style='color:#F1472F;'>${notification[0].sendTo}</span></td></tr><tr><td align='left' style='text-align: left; padding-bottom: 25px; font-family:Roboto, sans-serif; font-size:14px; mso-height-rule: exactly; line-height:22px; color: #747474;font-weight: 300;'>Here's what you missed at Motomob yesterday.</td></tr>`

  const notificationListUrl = `${process.env.MOTOMOB_PREFIX}/notifications`
  const profileUrl = `${process.env.MOTOMOB_PREFIX}/profile/${userId}`
  const settingsUrl = `${process.env.MOTOMOB_PREFIX}/settings/email-notification`
  for (let index = 0; index < notification.length; index++) {
    const n = notification[index]
    if (!n.hasActioned) {
      const url = `${process.env.MOTOMOB_PREFIX}${n.link}`
      allData += `<tr>
      <td style='border-bottom: 1px solid #EFF5F8;padding-bottom:10px;padding-top:10px;'>
        <table cellspacing='0' cellpadding='0' border='0' width='100%' class='email-container'>
          <tr>
            <td width='60' height='48'>
              <a href=${url}>
                <img src=${n.avatarUrl} alt=${n.actionBy} height='48' width='48' style='border-radius: 50%; border: none; text-decoration: none; '/>
              </a>
            </td>
            <td>
              <table cellspacing='0' cellpadding='0' border='0' width='100%' class='email-container'>
                <tr>
                  <td align='left' style='text-align: left; padding-bottom: 5px; font-family:Roboto, sans-serif; font-size:16px; mso-height-rule: exactly; line-height:22px; color: #333333;font-weight: 700;'>
                    <a href=${url} style='color: #333333; text-decoration: none; '>
                      ${n.actionBy}
                    </a>
                  </td>
                  <td align='right' colspan="2" style='text-align: right; padding-bottom: 5px; font-family:Roboto, sans-serif; font-size:14px; mso-height-rule: exactly; line-height:22px; color: #BABECB;font-weight: 300;'>
                    <a href=${url} style='color: #BABECB; text-decoration: none; '>
                      ${moment(n.createdAt).fromNow(true)} ago
                    <a/>
                  </td>
                </tr>
                <tr>
                 <td colspan="2" align='left' style='text-align: left; padding-bottom: 5px; font-family:Roboto, sans-serif; font-size:14px; mso-height-rule: exactly; line-height:22px; color: #BABECB;font-weight: 300;'>
                  <a href=${url} style='color: #BABECB; text-decoration: none; '>
                   ${n.message}
                  </a>
                 </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
      </tr>
      `
    }
  }
  allData += `<tr>
    <td align = 'center' style = 'padding:15px 0;'>
      <a href=${notificationListUrl} style="text-align: center; padding:8px 35px; border:1px solid #F1472F;border-radius: 5px; font-family:Roboto, sans-serif; font-size:14px; mso-height-rule: exactly; line-height:22px; color: #F1472F;display: inline-block;text-decoration: none; font-weight: 400;">See More</a>
  </td >
  </tr >
    <tr>
      <td align='left' style='text-align: left; padding-bottom: 5px; font-family:Roboto, sans-serif; font-size:14px; mso-height-rule: exactly; line-height:22px; color: #747474;font-weight: 300;font-style:italic;'>
        You can change frequency of those email by logging in to <a href=${profileUrl} style="color: #F1472F;">your account</a> and going to the <a href=${settingsUrl} style="color: #F1472F;">email notifications</a> under setting.
  </td>
    </tr>`
  allData += "</table>"
  var currentDate = moment().format("YYYY MMM Do")
  mail.send(
    email,
    "Notifications from motomob" + currentDate,
    "_",

    `${allData}
       
      <p style='font-family:Roboto, sans-serif; font-size:18px; mso-height-rule: exactly; line-height:22px; color: #747474;font-weight: 300;margin-bottom: 0;'>Thank you!</p>      
      <p style='font-family:Roboto, sans-serif; font-size:18px; mso-height-rule: exactly; line-height:22px; color: #747474;font-weight: 600;margin-bottom: 0;margin-top: 5px;'>MotoMob Team</p>
      `
  )
  allData += "</table></td></tr></table></center></td></tr></table>"
}

module.exports.dailyEmailNotification = async () => {
  return new Promise(async (resolve, _) => {
    try {
      const users = await User.find({ status: "normal", notificationFrequency: "daily" })
      for (let index = 0; index < users.length; index++) {
        const user = users[index]
        const notifications = await Notification.find({ sendTo: user.username, hasActioned: false }).sort({ _id: -1 }).limit(NOTIFICATION_FETCH_LIMIT)
        if (notifications.length > 0) {
          //         console.log(user.email)
          await sendMail(notifications, user.email, user.id)
          //sendMail(notifications, 'seema.kanhasoft@gmail.com', user.id)
        }
      }
      return resolve()
    } catch (err) {
      log(`Error in Weekly job ${err}`, "", "error", "cron")
    }
  })
}

module.exports.weeklyEmailNotification = async () => {
  try {
    return new Promise(async (resolve, _) => {
      const users = await User.find({ status: "normal", notificationFrequency: "weekly" })
      for (let index = 0; index < users.length; index++) {
        const user = users[index]
        const notifications = await Notification.find({ sendTo: user.username, hasActioned: false }).sort({ _id: -1 }).limit(NOTIFICATION_FETCH_LIMIT)
        if (notifications.length > 0) {
          //        console.log(user.email)
          await sendMail(notifications, user.email, user.id)
          //sendMail(notifications, 'seema.kanhasoft@gmail.com', user.id)
        }
      }
      return resolve()
    })
  } catch (err) {
    log(`Error in Weekly job ${err}`, "", "error", "cron")
  }
}
