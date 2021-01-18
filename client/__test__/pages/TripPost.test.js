const { POST_TITLE_ERROR, POST_DESCRIPTION_ERROR, POST_BIKE_ERROR, POST_LOCATION_ERROR, POST_START_DATE_ERROR, POST_DAYS_ERROR } = require("../test-messages")
const assert = require("assert")
const puppeteer = require("puppeteer")
const { SIGNIN_URL } = require("../test-messages")
const { HOME_URL } = require("../test-messages")
const { TRIP_POST_URL } = require("../test-messages")
let browser, page
jest.setTimeout(30000)
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

test("Should not select bike and location", async () => {
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

  var tripStory = await page.waitFor('a[href="/post/create/1"]')
  tripStory.click()
  await page.waitForNavigation()
  url = await page.url()
  assert(url === TRIP_POST_URL)

  await page.waitFor('input[placeholder="YYYY-MM-DD"]')
  await page.click('input[placeholder="YYYY-MM-DD"]')
  await page.waitFor(200)
  await page.type('input[placeholder="YYYY-MM-DD"]', "2020-11-02")

  await page.waitFor('input[name="days"]')
  await page.type('input[name="days"]', "10")

  await page.waitFor('textarea[name="title"]')
  await page.type('textarea[name="title"]', "Trip post test by motobot ")

  await page.waitFor(800)
  await page.waitForSelector('div[class="ql-editor ql-blank"]')
  await page.waitFor(800)
  await page.click('div[class="ql-editor ql-blank"]')
  await page.type(
    'div[class="ql-editor ql-blank"]',
    "Motomob test share an update Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the, "
  )

  await page.waitForSelector("input[class=search]")
  await page.click("input[class=search]")
  await page.type("input[class=search]", "testtag")

  await page.keyboard.press("Enter")

  await page.waitFor(800)

  await page.waitForSelector("#postSubmitBtn")
  await page.click('button[id="postSubmitBtn"]')

  var errorTexts = await page.$$eval("span[class=error-message]", elements => elements.map(item => item.textContent))

  let newErrorArray = []
  for (var i = 0; i < errorTexts.length; i++) {
    if (errorTexts[i] != "null" && errorTexts[i] != null) {
      newErrorArray.push(errorTexts[i])
    }
  }

  var errorLength = await newErrorArray.length
  if (errorLength > 0) {
    for (var j = 0; j < newErrorArray.length; j++) {
      if (newErrorArray[j] === POST_BIKE_ERROR) {
        assert(newErrorArray[j] === POST_BIKE_ERROR)
      } else if (newErrorArray[j] === POST_LOCATION_ERROR) {
        assert(newErrorArray[j] === POST_LOCATION_ERROR)
      }
    }
  }
})

test("Should not select start date of trip and how many days", async () => {
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

  var tripStory = await page.waitFor('a[href="/post/create/1"]')
  tripStory.click()
  await page.waitForNavigation()
  url = await page.url()
  assert(url === TRIP_POST_URL)

  await page.waitForSelector(".add-bike-rounded-button")
  page.click(".add-bike-rounded-button")

  await page.waitFor(800)

  await page.waitForSelector('input[placeholder="Search bike"]')
  await page.type('input[placeholder="Search bike"]', "ind")

  await page.waitFor(1000)
  var bikelist = await page.waitForSelector("div[id=bikeList]")
  await page.waitFor(1000)
  bikelist.click()

  await page.waitFor(800)
  await page.waitForSelector(".add-locations")
  page.click(".add-locations")
  await page.waitForSelector('input[name="location"]')
  await page.type('input[name="location"]', "USA ")
  await page.waitFor(800)
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await page.waitFor(800)

  await page.waitFor('textarea[name="title"]')
  await page.type('textarea[name="title"]', "Trip post test by motobot ")

  await page.waitFor(800)

  await page.waitForSelector('div[class="ql-editor ql-blank"]')
  await page.waitFor(800)
  await page.click('div[class="ql-editor ql-blank"]')
  await page.type(
    'div[class="ql-editor ql-blank"]',
    "Motomob test share an update Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the, "
  )

  await page.waitForSelector("input[class=search]")
  await page.click("input[class=search]")
  await page.type("input[class=search]", "testtag")

  await page.keyboard.press("Enter")

  await page.waitFor(800)

  await page.waitForSelector("#postSubmitBtn")
  await page.click('button[id="postSubmitBtn"]')

  var errorTexts = await page.$$eval("span[class=error-message]", elements => elements.map(item => item.textContent))

  let newErrorArray = []
  for (var i = 0; i < errorTexts.length; i++) {
    if (errorTexts[i] != "null" && errorTexts[i] != null) {
      newErrorArray.push(errorTexts[i])
    }
  }

  var errorLength = await newErrorArray.length
  if (errorLength > 0) {
    for (var j = 0; j < newErrorArray.length; j++) {
      if (newErrorArray[j] === POST_START_DATE_ERROR) {
        assert(newErrorArray[j] === POST_START_DATE_ERROR)
      } else if (newErrorArray[j] === POST_DAYS_ERROR) {
        assert(newErrorArray[j] === POST_DAYS_ERROR)
      }
    }
    console.log("errors", newErrorArray)
  }
})

test("Should not enter post title and description", async () => {
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

  var tripStory = await page.waitFor('a[href="/post/create/1"]')
  tripStory.click()
  await page.waitForNavigation()
  url = await page.url()
  assert(url === TRIP_POST_URL)

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
  await page.waitForSelector(".add-locations")
  page.click(".add-locations")
  await page.waitForSelector('input[name="location"]')
  await page.type('input[name="location"]', "USA ")
  await page.waitFor(800)
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")

  await page.waitFor(800)
  await page.waitFor('input[placeholder="YYYY-MM-DD"]')
  await page.click('input[placeholder="YYYY-MM-DD"]')
  await page.waitFor(200)
  await page.type('input[placeholder="YYYY-MM-DD"]', "2020-11-02")

  await page.waitFor('input[name="days"]')
  await page.type('input[name="days"]', "10")

  await page.waitForSelector("input[class=search]")
  await page.click("input[class=search]")
  await page.type("input[class=search]", "tripposttagbymotobot")

  await page.keyboard.press("Enter")

  await page.waitFor(800)

  await page.waitForSelector("#postSubmitBtn")
  await page.click('button[id="postSubmitBtn"]')

  var errorTexts = await page.$$eval("span[class=error-message]", elements => elements.map(item => item.textContent))

  let newErrorArray = []
  for (var i = 0; i < errorTexts.length; i++) {
    if (errorTexts[i] != "null" && errorTexts[i] != null) {
      newErrorArray.push(errorTexts[i])
    }
  }

  var errorLength = await newErrorArray.length
  if (errorLength > 0) {
    for (var j = 0; j < newErrorArray.length; j++) {
      if (newErrorArray[j] === POST_TITLE_ERROR) {
        assert(newErrorArray[j] === POST_TITLE_ERROR)
      } else if (newErrorArray[j] === POST_DESCRIPTION_ERROR) {
        assert(newErrorArray[j] === POST_DESCRIPTION_ERROR)
      }
    }
  }
})

test("Create trip post", async () => {
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

  var tripStory = await page.waitFor('a[href="/post/create/1"]')
  tripStory.click()
  await page.waitForNavigation()
  url = await page.url()
  assert(url === TRIP_POST_URL)

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
  await page.waitForSelector(".add-locations")
  page.click(".add-locations")
  await page.waitForSelector('input[name="location"]')
  await page.type('input[name="location"]', "USA ")
  await page.waitFor(800)
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")

  await page.waitFor(800)
  await page.waitFor('input[placeholder="YYYY-MM-DD"]')
  await page.click('input[placeholder="YYYY-MM-DD"]')
  await page.waitFor(200)
  await page.type('input[placeholder="YYYY-MM-DD"]', "2020-11-02")

  await page.waitFor('input[name="days"]')
  await page.type('input[name="days"]', "10")

  await page.waitFor(800)

  await page.waitFor('textarea[name="title"]')
  await page.type('textarea[name="title"]', "Trip post test by motobot ")

  await page.waitFor(800)

  await page.waitForSelector('div[class="ql-editor ql-blank"]')
  await page.waitFor(800)
  await page.click('div[class="ql-editor ql-blank"]')
  await page.type(
    'div[class="ql-editor ql-blank"]',
    "Motomob test share an update Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the, "
  )

  await page.waitFor(800)

  await page.waitForSelector("input[class=search]")
  await page.click("input[class=search]")
  await page.type("input[class=search]", "tripposttagbymotobot")

  await page.keyboard.press("Enter")

  await page.waitFor(800)

  await page.waitForSelector("#postSubmitBtn")
  await page.click('button[id="postSubmitBtn"]')
  await page.waitFor(1000)
})

test("Create trip post with images", async () => {
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

  var tripStory = await page.waitFor('a[href="/post/create/1"]')
  tripStory.click()
  await page.waitForNavigation()
  url = await page.url()
  assert(url === TRIP_POST_URL)

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
  await page.waitForSelector(".add-locations")
  page.click(".add-locations")
  await page.waitForSelector('input[name="location"]')
  await page.type('input[name="location"]', "USA ")
  await page.waitFor(800)
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")

  await page.waitFor(800)
  await page.waitFor('input[placeholder="YYYY-MM-DD"]')
  await page.click('input[placeholder="YYYY-MM-DD"]')
  await page.waitFor(200)
  await page.type('input[placeholder="YYYY-MM-DD"]', "2020-11-02")

  await page.waitFor('input[name="days"]')
  await page.type('input[name="days"]', "10")

  await page.waitFor(800)

  await page.waitFor('textarea[name="title"]')
  await page.type('textarea[name="title"]', "Trip post test by motobot ")

  await page.waitFor(800)

  await page.waitForSelector('div[class="ql-editor ql-blank"]')
  await page.waitFor(800)
  await page.click('div[class="ql-editor ql-blank"]')
  await page.type(
    'div[class="ql-editor ql-blank"]',
    "Motomob test share an update Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the, "
  )

  await page.waitFor(800)

  await page.waitForSelector("input[class=search]")
  await page.click("input[class=search]")
  await page.type("input[class=search]", "tripposttagbymotobot")

  await page.keyboard.press("Enter")

  await page.waitFor(800)

  const inputUploadHandle = await page.$("input[id=picFile]")
  await inputUploadHandle.uploadFile("./__test__/images/cjmeister-com-_CJ05957.jpg")
  await page.waitForTimeout(3000)

  await page.waitForSelector("#postSubmitBtn")
  await page.click('button[id="postSubmitBtn"]')
  await page.waitFor(1000)
})

test("Create trip post with 5 gpx files ", async () => {
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

  var tripStory = await page.waitFor('a[href="/post/create/1"]')
  tripStory.click()
  await page.waitForNavigation()
  url = await page.url()
  assert(url === TRIP_POST_URL)

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
  await page.waitForSelector(".add-locations")
  page.click(".add-locations")
  await page.waitForSelector('input[name="location"]')
  await page.type('input[name="location"]', "USA ")
  await page.waitFor(800)
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")

  await page.waitFor(800)
  await page.waitFor('input[placeholder="YYYY-MM-DD"]')
  await page.click('input[placeholder="YYYY-MM-DD"]')
  await page.waitFor(200)
  await page.type('input[placeholder="YYYY-MM-DD"]', "2020-11-02")

  await page.waitFor('input[name="days"]')
  await page.type('input[name="days"]', "10")

  await page.waitFor(800)

  await page.waitFor('textarea[name="title"]')
  await page.type('textarea[name="title"]', "Trip post test by motobot ")

  await page.waitFor(200)

  await page.waitForSelector('div[class="ql-editor ql-blank"]')
  await page.waitFor(200)
  await page.click('div[class="ql-editor ql-blank"]')
  await page.type(
    'div[class="ql-editor ql-blank"]',
    "Motomob test share an update Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the, "
  )

  await page.waitFor(800)

  await page.waitForSelector("input[class=search]")
  await page.click("input[class=search]")
  await page.type("input[class=search]", "tripposttagbymotobot")

  await page.waitFor(800)
  await page.keyboard.press("Enter")

  await page.waitFor(800)

  const gpxUpload = await page.$('input[accept=".gpx"]')
  await gpxUpload.uploadFile("./__test__/images/pic1.gpx", "./__test__/images/pic2.gpx")
  await page.waitForTimeout(1000)
  await page.waitForSelector("#postSubmitBtn")
  await page.click('button[id="postSubmitBtn"]')
  await page.waitFor(1000)
})

test("Create trip post with 5 gpx files ", async () => {
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

  var tripStory = await page.waitFor('a[href="/post/create/1"]')
  tripStory.click()
  await page.waitForNavigation()
  url = await page.url()
  assert(url === TRIP_POST_URL)

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
  await page.waitForSelector(".add-locations")
  page.click(".add-locations")
  await page.waitForSelector('input[name="location"]')
  await page.type('input[name="location"]', "USA ")
  await page.waitFor(800)
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")

  await page.waitFor(800)
  await page.waitFor('input[placeholder="YYYY-MM-DD"]')
  await page.click('input[placeholder="YYYY-MM-DD"]')
  await page.waitFor(200)
  await page.type('input[placeholder="YYYY-MM-DD"]', "2020-11-02")

  await page.waitFor('input[name="days"]')
  await page.type('input[name="days"]', "10")

  await page.waitFor(800)

  await page.waitFor('textarea[name="title"]')
  await page.type('textarea[name="title"]', "Trip post test by motobot ")

  await page.waitFor(200)

  await page.waitForSelector('div[class="ql-editor ql-blank"]')
  await page.waitFor(200)
  await page.click('div[class="ql-editor ql-blank"]')
  await page.type(
    'div[class="ql-editor ql-blank"]',
    "Motomob test share an update Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the, "
  )

  await page.waitFor(800)

  await page.waitForSelector("input[class=search]")
  await page.click("input[class=search]")
  await page.type("input[class=search]", "tripposttagbymotobot")

  await page.waitFor(800)
  await page.keyboard.press("Enter")

  await page.waitFor(800)

  const gpxUpload = await page.$('input[accept=".gpx"]')
  await gpxUpload.uploadFile("./__test__/images/pic1.gpx", "./__test__/images/pic2.gpx")
  await page.waitForTimeout(1000)
  await page.waitForSelector("#postSubmitBtn")
  await page.click('button[id="postSubmitBtn"]')
  await page.waitFor(1000)
})

