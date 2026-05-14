export type MenuItem = {
    title: string;
    link: string;
    subMenuItems?: Record<string, MenuItem>;
    parentMenuItem?: MenuItem | null;
}

export default class AdminPage2 {
    page: any;

    constructor(page: any) {
        this.page = page;
    }

    async goto() {
        await this.page.goto('/wp-admin');
        await this.page.waitForLoadState('networkidle');
    }

    async isLoggedIn() {
        return await this.page.isVisible(this.selectors.dashboardHeader);
    }

    async getAllMenuItems(): Promise<Record<string, MenuItem>> {
        console.log("Search for all menu items");

        const menuDict = await this.page.$$eval(
            this.selectors.adminMenuItems,
            (items: Element[], selectors: any) => {
                const menuItems: Record<string, any> = {};

                items.forEach((item) => {
                    const menuItem: MenuItem = {
                        title: item.querySelector(selectors.adminMenuItemLabel)?.childNodes[0]?.textContent?.trim() || '',
                        link: item.querySelector('a')?.getAttribute('href') || ''
                    }

                    const subMenuLinks = item.querySelectorAll(selectors.adminSubMenuItems);
                    if (subMenuLinks.length > 0) {
                        menuItem.subMenuItems = {};

                        subMenuLinks.forEach((sub) => {
                            const subMenuItem: MenuItem = {
                                title: sub.textContent?.trim() || '',
                                link: sub.getAttribute('href') || '',
                                parentMenuItem: menuItem
                            }

                            menuItem.subMenuItems![subMenuItem.title] = subMenuItem;
                        });
                    }

                    menuItems[menuItem.title] = menuItem;
                });

                return menuItems;
            },
            this.selectors
        );

        console.log(`Found ${Object.keys(menuDict).length} menu items`);
        return menuDict;
    }


    async getMenuItem(mainMenuTitle: string, subMenutitle: string) {
        const menuItems = await this.getAllMenuItems();

        if (!(mainMenuTitle in menuItems))
            throw new Error(`Main menu item "${mainMenuTitle}" not found`);

        let menuItem = menuItems[mainMenuTitle];

        if (subMenutitle) {
            if (!menuItem.subMenuItems || Object.keys(menuItem.subMenuItems).length === 0)
                throw new Error(`Main menu item "${mainMenuTitle}" has no sub menu`);

            if (!(subMenutitle in menuItem.subMenuItems))
                throw new Error(`Main menu item "${mainMenuTitle}" has no sub menu item "${subMenutitle}"`);

            return menuItem.subMenuItems[subMenutitle];
        }

        return menuItem;
    }

    async clickMenuItem(mainMenuTitle: string, subMenutitle: string) {
        const menuItem = await this.getMenuItem(mainMenuTitle, subMenutitle);
        await this.page.goto(menuItem.link);
        await this.page.waitForLoadState('networkidle');
    }

    get selectors() {
        return {
            adminMenuItems: '#adminmenu li.menu-top',
            adminMenuItemLabel: '.wp-menu-name',
            adminSubMenuItems: 'ul.wp-submenu li a',
            dashboardHeader: '[data-testid="dashboard-header"]'
        };
    }
}