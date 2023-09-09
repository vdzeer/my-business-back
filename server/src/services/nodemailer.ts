import * as nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport(
  {
    host: 'smtp.gmail.com',
    post: '587',
    secure: true,
    auth: {
      user: 'mybusinessplusbot@gmail.com',
      pass: 'oexafumriuumsjtc',
    },
  },
  {
    from: `Bot`,
  },
)

export const nodemailerService = message => {
  transporter.sendMail(message, (e, info) => {
    if (e) return console.log(e)
  })
}
