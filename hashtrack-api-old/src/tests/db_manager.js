import { prisma as Prisma } from '@prisma'
export default class DBManager {
  constructor(prisma = Prisma) {
    this.prisma = prisma
  }

  async dropDatabase() {
    try {
      await this.prisma.deleteManyUsers()
      await this.prisma.deleteManyPosts()
      await this.prisma.deleteManyWebhooks()
    } catch (err) {
      console.error(err)
    }
  }

  async getUsersCount() {
    return await this.prisma.usersConnection().aggregate().count();
  }

  async getWebhooksCount() {
    return await this.prisma.webhooksConnection().aggregate().count();
  }

  async getPostsCount() {
    return await this.prisma.postsConnection().aggregate().count();
  }
}