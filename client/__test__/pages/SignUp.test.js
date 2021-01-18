const assert = require("assert")
const puppeteer = require("puppeteer")
const { SIGNUP_URL } = require("../test-messages")
const { SIGNUP_BLANK_USERNAME_ERROR, SIGNUP_BLANK_FULLNAME_ERROR, SIGNUP_BLANK_EMAIL_ERROR, SIGNUP_BLANK_LOCATION_ERROR, SIGNUP_BLANK_PASSWORD_ERROR, SIGNUP_BLANK_BIKE_ERROR, SIGNUP_ALREADYTAKEN_USERNAME_ERROR, SIGNUP_ALREADYTAKEN_EMAIL_ERROR, SIGNUP_USERNAME_VALIDATION_ERROR } = require("../test-messages")

let browser, page
jest.setTimeout(30000)

beforeEach(async () => {
    browser = await puppeteer.launch({
        headless: true,
        devtools: false
    })

    page = await browser.newPage()
    await page.goto(SIGNUP_URL)
})

afterEach(async () => {
    await browser.close()
})

function makeid(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

test("Register user with motobot", async () => {
    await page.waitFor('button[class="ui button btn-mail btn-register-with"]')
    await page.click('button[class="ui button btn-mail btn-register-with"]')
    await page.waitFor(1000)
    await page.waitFor('form[class="ui form"]')

    await page.waitForSelector('input[name="username"]')
    await page.type('input[name="username"]', makeid(6))

    await page.waitForSelector('input[name="name"]')
    await page.type('input[name="name"]', "Dhwani Patel")

    var chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    var string = '';
    for (var ii = 0; ii < 15; ii++) {
        string += chars[Math.floor(Math.random() * chars.length)];
    }
    await page.waitForSelector('input[name="email"]')
    await page.type('input[name="email"]', string + '@gmail.com')

    await page.waitForSelector('input[name="location"]')
    await page.type('input[name="location"]', "Ahmedabad ")
    await page.waitFor(800)
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await page.waitFor(800)

    await page.waitForSelector('input[name="password"]')
    await page.type('input[name="password"]', "12345678")

    await page.waitForSelector(".add-bike-rounded-button")
    page.click(".add-bike-rounded-button")
    await page.waitFor(800)
    await page.waitForSelector('input[placeholder="Search bike"]')
    await page.type('input[placeholder="Search bike"]', "ajp ")
    await page.waitFor(1000)
    var bikelist = await page.waitForSelector("div[id=bikeList]")
    await page.waitFor(1000)
    bikelist.click()
    await page.waitFor(1000)

    await page.waitFor('button[class="ui red button"]')
    await page.click('button[class="ui red button"]')
    await page.waitFor(1000)
    await page.waitFor('button[class="ui red small button"]')
    await page.click('button[class="ui red small button"]')
    await page.waitFor(1000)

})

test("Register without adding data in any field", async () => {
    await page.waitFor('button[class="ui button btn-mail btn-register-with"]')
    await page.click('button[class="ui button btn-mail btn-register-with"]')
    await page.waitFor(1000)
    await page.waitFor('form[class="ui form"]')

    await page.waitFor('button[class="ui red button"]')
    await page.click('button[class="ui red button"]')
    await page.waitFor(1000)


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
            if (newErrorArray[j] === SIGNUP_BLANK_USERNAME_ERROR) {
                assert(newErrorArray[j] === SIGNUP_BLANK_USERNAME_ERROR)
            } else if (newErrorArray[j] === SIGNUP_BLANK_FULLNAME_ERROR) {
                assert(newErrorArray[j] === SIGNUP_BLANK_FULLNAME_ERROR)
            } else if (newErrorArray[j] === SIGNUP_BLANK_EMAIL_ERROR) {
                assert(newErrorArray[j] === SIGNUP_BLANK_EMAIL_ERROR)
            } else if (newErrorArray[j] === SIGNUP_BLANK_LOCATION_ERROR) {
                assert(newErrorArray[j] === SIGNUP_BLANK_LOCATION_ERROR)
            } else if (newErrorArray[j] === SIGNUP_BLANK_PASSWORD_ERROR) {
                assert(newErrorArray[j] === SIGNUP_BLANK_PASSWORD_ERROR)
            } else if (newErrorArray[j] === SIGNUP_BLANK_BIKE_ERROR) {
                assert(newErrorArray[j] === SIGNUP_BLANK_BIKE_ERROR)
                console.log("errors", newErrorArray)
            }
        }
    }
})

test("Register with already registered username", async () => {
    await page.waitFor('button[class="ui button btn-mail btn-register-with"]')
    await page.click('button[class="ui button btn-mail btn-register-with"]')
    await page.waitFor(1000)
    await page.waitFor('form[class="ui form"]')

    await page.waitForSelector('input[name="username"]')
    await page.type('input[name="username"]', "DhwaniPtl")

    await page.waitForSelector('input[name="name"]')
    await page.type('input[name="name"]', "Dhwani Patel")

    var chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    var string = '';
    for (var ii = 0; ii < 15; ii++) {
        string += chars[Math.floor(Math.random() * chars.length)];
    }
    await page.waitForSelector('input[name="email"]')
    await page.type('input[name="email"]', string + '@gmail.com')

    await page.waitForSelector('input[name="location"]')
    await page.type('input[name="location"]', "Ahmedabad ")
    await page.waitFor(800)
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await page.waitFor(800)

    await page.waitForSelector('input[name="password"]')
    await page.type('input[name="password"]', "12345678")

    await page.waitForSelector(".add-bike-rounded-button")
    page.click(".add-bike-rounded-button")
    await page.waitFor(800)
    await page.waitForSelector('input[placeholder="Search bike"]')
    await page.type('input[placeholder="Search bike"]', "ajp ")
    await page.waitFor(1000)
    var bikelist = await page.waitForSelector("div[id=bikeList]")
    await page.waitFor(1000)
    bikelist.click()
    await page.waitFor(1000)


    await page.waitFor('button[class="ui red button"]')
    await page.click('button[class="ui red button"]')
    await page.waitFor(1000)

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
            if (newErrorArray[j] === SIGNUP_ALREADYTAKEN_USERNAME_ERROR) {
                assert(newErrorArray[j] === SIGNUP_ALREADYTAKEN_USERNAME_ERROR)
                console.log("error", newErrorArray)
            }
        }
    }
})

test("Register user with already registered email", async () => {
    await page.waitFor('button[class="ui button btn-mail btn-register-with"]')
    await page.click('button[class="ui button btn-mail btn-register-with"]')
    await page.waitFor(1000)
    await page.waitFor('form[class="ui form"]')

    await page.waitForSelector('input[name="username"]')
    await page.type('input[name="username"]', makeid(6))

    await page.waitForSelector('input[name="name"]')
    await page.type('input[name="name"]', "Dhwani Patel")

    await page.waitForSelector('input[name="email"]')
    await page.type('input[name="email"]', "dhwanipatel.728@gmail.com")

    await page.waitForSelector('input[name="location"]')
    await page.type('input[name="location"]', "Ahmedabad ")
    await page.waitFor(800)
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await page.waitFor(800)

    await page.waitForSelector('input[name="password"]')
    await page.type('input[name="password"]', "12345678")

    await page.waitForSelector(".add-bike-rounded-button")
    page.click(".add-bike-rounded-button")
    await page.waitFor(800)
    await page.waitForSelector('input[placeholder="Search bike"]')
    await page.type('input[placeholder="Search bike"]', "ajp ")
    await page.waitFor(1000)
    var bikelist = await page.waitForSelector("div[id=bikeList]")
    await page.waitFor(1000)
    bikelist.click()
    await page.waitFor(1000)

    await page.waitFor('button[class="ui red button"]')
    await page.click('button[class="ui red button"]')
    await page.waitFor(1000)

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
            if (newErrorArray[j] === SIGNUP_ALREADYTAKEN_EMAIL_ERROR) {
                assert(newErrorArray[j] === SIGNUP_ALREADYTAKEN_EMAIL_ERROR)
                console.log("error", newErrorArray)
            }
        }
    }
})

test("Register user with username more than 10 characters", async () => {
    await page.waitFor('button[class="ui button btn-mail btn-register-with"]')
    await page.click('button[class="ui button btn-mail btn-register-with"]')
    await page.waitFor(1000)
    await page.waitFor('form[class="ui form"]')

    await page.waitForSelector('input[name="username"]')
    await page.type('input[name="username"]', makeid(12))

    await page.waitForSelector('input[name="name"]')
    await page.type('input[name="name"]', "Dhwani Patel")

    await page.waitForSelector('input[name="email"]')
    await page.type('input[name="email"]', "dhwanipatel.728@gmail.com")

    await page.waitForSelector('input[name="location"]')
    await page.type('input[name="location"]', "Ahmedabad ")
    await page.waitFor(800)
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await page.waitFor(800)

    await page.waitForSelector('input[name="password"]')
    await page.type('input[name="password"]', "12345678")

    await page.waitForSelector(".add-bike-rounded-button")
    page.click(".add-bike-rounded-button")
    await page.waitFor(800)
    await page.waitForSelector('input[placeholder="Search bike"]')
    await page.type('input[placeholder="Search bike"]', "ajp ")
    await page.waitFor(1000)
    var bikelist = await page.waitForSelector("div[id=bikeList]")
    await page.waitFor(1000)
    bikelist.click()
    await page.waitFor(1000)

    await page.waitFor('button[class="ui red button"]')
    await page.click('button[class="ui red button"]')
    await page.waitFor(1000)

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
            if (newErrorArray[j] === SIGNUP_USERNAME_VALIDATION_ERROR) {
                assert(newErrorArray[j] === SIGNUP_USERNAME_VALIDATION_ERROR)
                console.log("error", newErrorArray)
            }
        }
    }
})

