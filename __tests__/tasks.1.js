const puppeteer = require("puppeteer");
const path = require('path');
const browserOptions = {
    headless: true,
    ignoreHTTPSErrors: true,
}

let browser;
let page;
let stepsBottomLeftToTopRight;
let stepsTopLeftToBottomRight;

beforeAll(async () => {
    browser = await puppeteer.launch(browserOptions);
    page = await browser.newPage();
    await page.goto('file://' + path.resolve('./index.html'));
    const positions = await page.$$eval('body *', els => els.map(el => {
        const { top, left, bottom, right, width, height } = el.getBoundingClientRect()
        const { margin, padding } = getComputedStyle(el)
        return { top, left, bottom, right, width, height, margin, padding }
    }))

    stepsBottomLeftToTopRight = positions.filter((pos, i, all) => {
        return all.find(p => {
            return p.bottom === pos.top && p.left === pos.right || p.top === pos.bottom && p.right === pos.left
        })
    })

    stepsTopLeftToBottomRight = positions.filter((pos, i, all) => {
        return all.find(p => {
            return p.bottom === pos.top && p.right === pos.left || p.top === pos.bottom && p.left === pos.right
        })
    })
}, 30000);

afterAll((done) => {
    try {
        this.puppeteer.close();
    } catch (e) { }
    done();
});

describe("Green staircase", () => {
    it("Boxes are arranged as staircase", async () => {
        expect(stepsBottomLeftToTopRight.length).toBeGreaterThanOrEqual(4)
    })

    it("All boxes have the same size", async () => {
        const groups = stepsBottomLeftToTopRight.reduce((acc, step) => {
            const { width } = step
            const sizeArr = acc.find(arr => arr.some(s => s.width == width))
            if(!sizeArr) {
                acc.push([step])
                return acc
            }
            sizeArr.push(step)
            return acc
        }, [])

        const groupOfFour = groups.find(gr => gr.length == 4)
        expect(groupOfFour).toBeTruthy()
    })

    it("Margin is used to position the boxes", async () => {
        const boxesWithMargin = stepsBottomLeftToTopRight.filter(box => box.margin.split(" ").some(m => m !== '0px'))
        expect(boxesWithMargin.length).toBeGreaterThanOrEqual(3)
    })
})

describe("Yellow staircase", () => {
    it("Boxes are arranged as staircase", async () => {
        console.log(stepsTopLeftToBottomRight)
        expect(stepsTopLeftToBottomRight.length).toBeGreaterThanOrEqual(4)
    })

    it("Padding is used to position the boxes", async () => {
        const boxesWithPadding = stepsTopLeftToBottomRight.filter(box => box.padding.split(" ").some(m => m !== '0px'))
        expect(boxesWithPadding.length).toBeGreaterThanOrEqual(2)
    })
})