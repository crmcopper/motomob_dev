const { POST_TITLE_ERROR, POST_DESCRIPTION_ERROR, POST_BIKE_ERROR } = require("../test-messages")
const assert = require("assert")
const { SIGNIN_URL } = require("../test-messages")
const { HOME_URL } = require("../test-messages")
const { BIKE_POST_URL } = require("../test-messages")
const puppeteer = require("puppeteer")
let browser, page
jest.setTimeout(300000)
beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: true,
    devtools: false,
    args: ["--start-maximized"]
  })
  page = await browser.newPage()
  await page.goto(SIGNIN_URL)
})
afterEach(async () => {
  await browser.close()
})

test("Should not post title", async () => {
  var url = await page.url()
  assert(url === SIGNIN_URL)
  var el = await page.$("[name=username]")
  await el.type("motobot")
  var elpass = await page.$("[name=password]")
  await elpass.type("test@123")
  await page.waitFor('button[class="ui red button"]')
  await page.click('button[class="ui red button"]')
  await page.waitFor(2000)
  url = await page.url()
  assert(url === HOME_URL)
  await page.waitFor(5000)

  var bikeStory = await page.waitFor('a[href="/post/create"]')
  bikeStory.click()
  await page.waitFor(1000)
  url = await page.url()
  assert(url === BIKE_POST_URL)

  await page.waitForSelector(".add-bike-rounded-button")
  page.click(".add-bike-rounded-button")

  await page.waitFor(800)

  await page.waitForSelector('input[placeholder="Search bike"]')
  await page.type('input[placeholder="Search bike"]', "ajp ")

  await page.waitFor(1000)
  var bikelist = await page.waitForSelector("div[id=bikeList]")
  await page.waitFor(1000)
  bikelist.click()

  await page.waitFor(800)
  await page.waitForSelector('div[class="ql-editor ql-blank"]')
  await page.waitFor(800)
  await page.click('div[class="ql-editor ql-blank"]')
  await page.type(
    'div[class="ql-editor ql-blank"]',
    "Motomob test share an update \n  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the,"
  )

  await page.waitForSelector("input[class=search]")
  await page.click("input[class=search]")
  await page.type("input[class=search]", "testtag")

  await page.keyboard.press("Enter")

  await page.waitFor(800)

  await page.waitForSelector("#postSubmitBtn")
  await page.click('button[id="postSubmitBtn"]')
  await page.waitFor(1000)

  var errorTexts = await page.$$eval("span[class=error-message]", elements =>
    elements.map((item, POST_TITLE_ERROR) => {
      if (item.textContent === POST_TITLE_ERROR) {
        return item.textContent
      }
    })
  )

  let newErrorArray = []
  for (var i = 0; i < errorTexts.length; i++) {
    if (errorTexts[i] != "null" && errorTexts[i] != null) {
      newErrorArray.push(errorTexts[i])
    }
  }

  var errorLength = await newErrorArray.length
  if (errorLength > 0) {
    assert(newErrorArray[0] === POST_TITLE_ERROR)
    console.log("errors", newErrorArray[0])
  }
})

test("Should not select any bike", async () => {
  var url = await page.url()
  assert(url === SIGNIN_URL)
  var el = await page.$("[name=username]")
  await el.type("motobot")
  var elpass = await page.$("[name=password]")
  await elpass.type("test@123")
  await page.waitFor('button[class="ui red button"]')
  await page.click('button[class="ui red button"]')
  await page.waitForNavigation()
  url = await page.url()
  assert(url === HOME_URL)
  await page.waitFor(5000)

  var bikeStory = await page.waitFor('a[href="/post/create"]')
  bikeStory.click()
  await page.waitForNavigation()
  url = await page.url()
  assert(url === BIKE_POST_URL)

  await page.waitFor('textarea[name="title"]')
  await page.type('textarea[name="title"]', "Bike post test by motobot ")

  await page.waitFor(800)
  await page.waitForSelector('div[class="ql-editor ql-blank"]')
  await page.waitFor(800)
  await page.click('div[class="ql-editor ql-blank"]')
  await page.type(
    'div[class="ql-editor ql-blank"]',
    "Motomob test share an update \n  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the,"
  )

  await page.waitForSelector("input[class=search]")
  await page.click("input[class=search]")
  await page.type("input[class=search]", "bikepostTag")

  await page.keyboard.press("Enter")

  await page.waitFor(800)

  await page.waitForSelector("#postSubmitBtn")
  await page.click('button[id="postSubmitBtn"]')

  var errorTexts = await page.$$eval("span[class=error-message]", elements =>
    elements.map((item, POST_BIKE_ERROR) => {
      if (item.textContent === POST_BIKE_ERROR) {
        return item.textContent
      }
    })
  )

  let newErrorArray = []
  for (var i = 0; i < errorTexts.length; i++) {
    if (errorTexts[i] != "null" && errorTexts[i] != null) {
      newErrorArray.push(errorTexts[i])
    }
  }

  var errorLength = await newErrorArray.length
  if (errorLength > 0) {
    assert(newErrorArray[0] === POST_BIKE_ERROR)
    console.log("errors", newErrorArray[0])
  }
})

test("Should not enter post description", async () => {
  var url = await page.url()
  assert(url === SIGNIN_URL)
  var el = await page.$("[name=username]")
  await el.type("motobot")
  var elpass = await page.$("[name=password]")
  await elpass.type("test@123")
  await page.waitFor('button[class="ui red button"]')
  await page.click('button[class="ui red button"]')
  await page.waitForNavigation()
  url = await page.url()
  assert(url === HOME_URL)
  await page.waitFor(5000)

  var bikeStory = await page.waitFor('a[href="/post/create"]')
  bikeStory.click()
  await page.waitForNavigation()
  url = await page.url()
  assert(url === BIKE_POST_URL)

  await page.waitForSelector(".add-bike-rounded-button")
  page.click(".add-bike-rounded-button")

  await page.waitFor(800)

  await page.waitForSelector('input[placeholder="Search bike"]')
  await page.type('input[placeholder="Search bike"]', "ajp ")

  await page.waitFor(1000)
  var bikelist = await page.waitForSelector("div[id=bikeList]")
  await page.waitFor(1000)
  bikelist.click()

  await page.waitFor(800)

  await page.waitFor('textarea[name="title"]')
  await page.type('textarea[name="title"]', "Bike post test by motobot ")

  await page.waitFor(800)

  await page.waitForSelector("input[class=search]")
  await page.click("input[class=search]")
  await page.type("input[class=search]", "bikepost")

  await page.keyboard.press("Enter")

  await page.waitFor(800)

  await page.waitForSelector("#postSubmitBtn")
  await page.click('button[id="postSubmitBtn"]')

  var errorTexts = await page.$$eval("span[class=error-message]", elements =>
    elements.map((item, POST_DESCRIPTION_ERROR) => {
      if (item.textContent === POST_DESCRIPTION_ERROR) {
        return item.textContent
      }
    })
  )

  let newErrorArray = []
  for (var i = 0; i < errorTexts.length; i++) {
    if (errorTexts[i] != "null" && errorTexts[i] != null) {
      newErrorArray.push(errorTexts[i])
    }
  }

  var errorLength = await newErrorArray.length
  if (errorLength > 0) {
    assert(newErrorArray[0] === POST_DESCRIPTION_ERROR)
    console.log("errors", newErrorArray[0])
  }
})

test("Create bike post", async () => {
  var url = await page.url()
  assert(url === SIGNIN_URL)
  var el = await page.$("[name=username]")
  await el.type("motobot")
  var elpass = await page.$("[name=password]")
  await elpass.type("test@123")
  await page.waitFor('button[class="ui red button"]')
  await page.click('button[class="ui red button"]')
  await page.waitForNavigation()
  url = await page.url()
  assert(url === HOME_URL)
  await page.waitFor(5000)

  var bikeStory = await page.waitFor('a[href="/post/create"]')
  bikeStory.click()
  await page.waitForNavigation()
  url = await page.url()
  assert(url === BIKE_POST_URL)

  await page.waitForSelector(".add-bike-rounded-button")
  page.click(".add-bike-rounded-button")

  await page.waitFor(800)

  await page.waitForSelector('input[placeholder="Search bike"]')
  await page.type('input[placeholder="Search bike"]', "ajp ")

  await page.waitFor(1000)
  var bikelist = await page.waitForSelector("div[id=bikeList]")
  await page.waitFor(1000)
  bikelist.click()

  await page.waitFor(800)

  await page.waitFor('textarea[name="title"]')
  await page.type('textarea[name="title"]', "Bike post test by motobot ")

  await page.waitFor(800)

  await page.waitForSelector('div[class="ql-editor ql-blank"]')
  await page.waitFor(800)
  await page.click('div[class="ql-editor ql-blank"]')
  await page.type(
    'div[class="ql-editor ql-blank"]',
    "Motomob test share an update \n  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the,"
  )

  await page.waitFor(800)
  await page.waitForSelector("input[class=search]")
  await page.click("input[class=search]")
  await page.type("input[class=search]", "bikepost")

  await page.keyboard.press("Enter")

  await page.waitFor(800)

  await page.waitForSelector("#postSubmitBtn")
  await page.click('button[id="postSubmitBtn"]')
  await page.waitFor(1000)
})

test("Create bike post with bike image", async () => {
  var url = await page.url()
  assert(url === SIGNIN_URL)
  var el = await page.$("[name=username]")
  await el.type("motobot")
  var elpass = await page.$("[name=password]")
  await elpass.type("test@123")
  await page.waitFor('button[class="ui red button"]')
  await page.click('button[class="ui red button"]')
  await page.waitFor(2000)
  url = await page.url()
  assert(url === HOME_URL)
  await page.waitFor(5000)

  await page.waitFor('a[href="/post/create"]')
  await page.click('a[href="/post/create"]')
  await page.waitFor(1000)
  url = await page.url()
  assert(url === BIKE_POST_URL)
  await page.waitFor(1000)

  await page.waitFor('button[class="ui button add-bike-rounded-button"]')
  page.click('button[class="ui button add-bike-rounded-button"]')

  await page.waitFor(800)

  await page.waitForSelector('input[placeholder="Search bike"]')
  await page.type('input[placeholder="Search bike"]', "ajp ")

  await page.waitFor(1000)
  var bikelist = await page.waitForSelector("div[id=bikeList]")
  await page.waitFor(1000)
  bikelist.click()

  await page.waitFor(800)

  await page.waitFor('textarea[name="title"]')
  await page.type('textarea[name="title"]', "Bike post test by motobot ")

  await page.waitFor(800)

  await page.waitForSelector('div[class="ql-editor ql-blank"]')
  await page.waitFor(800)
  await page.click('div[class="ql-editor ql-blank"]')
  await page.type(
    'div[class="ql-editor ql-blank"]',
    "Motomob test share an update \n  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the,"
  )

  await page.waitFor(800)
  await page.waitForSelector("input[class=search]")
  await page.click("input[class=search]")
  await page.type("input[class=search]", "bikepost")

  await page.keyboard.press("Enter")

  await page.waitFor(800)

  const inputUploadHandle = await page.$("input[id=picFile]")
  await inputUploadHandle.uploadFile("./__test__/images/cjmeister-com-_CJ05957.jpg")
  await page.waitForTimeout(3000)

  await page.waitForSelector("#postSubmitBtn")
  await page.click('button[id="postSubmitBtn"]')
  await page.waitFor(1000)

  // await page.waitForTimeout(1000)
})
