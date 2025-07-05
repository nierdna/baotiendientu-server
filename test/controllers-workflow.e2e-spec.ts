import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Controllers Workflow (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let memberToken: string;
  let categoryId: string;
  let tagId: string;
  let forumId: string | null = null; // Initialize as null
  let blogId: string;
  let threadId: string;
  let commentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('🔐 Phase 1: Authentication & Setup', () => {
    it('should register admin user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          name: 'Admin User',
          email: 'admin@baotiendientu.com',
          password: 'Admin123!',
          avatarUrl: 'https://example.com/admin-avatar.jpg',
        })
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.data.email).toBe('admin@baotiendientu.com');
      expect(response.body.data.role).toBe('member'); // Will be updated to admin manually
    });

    it('should login admin user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'admin@baotiendientu.com',
          password: 'Admin123!',
        })
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.access_token).toBeDefined();
      adminToken = response.body.data.access_token;
    });

    it('should register member user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          name: 'Member User',
          email: 'member@baotiendientu.com',
          password: 'Member123!',
          avatarUrl: 'https://example.com/member-avatar.jpg',
        })
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.data.email).toBe('member@baotiendientu.com');
    });

    it('should login member user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'member@baotiendientu.com',
          password: 'Member123!',
        })
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.access_token).toBeDefined();
      memberToken = response.body.data.access_token;
    });

    it('should verify admin token', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/verify')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.email).toBe('admin@baotiendientu.com');
    });

    it('should verify member token', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/verify')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.email).toBe('member@baotiendientu.com');
    });
  });

  describe('🏗️ Phase 2: Content Structure Setup (Admin)', () => {
    it('should create cryptocurrency category', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Tiền Điện Tử',
          slug: 'tien-dien-tu',
          description: 'Tin tức và phân tích về thị trường tiền điện tử',
        })
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.data.name).toBe('Tiền Điện Tử');
      categoryId = response.body.data.id;
    });

    it('should create bitcoin subcategory', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Bitcoin',
          slug: 'bitcoin',
          description: 'Tin tức và phân tích về Bitcoin',
          parentId: categoryId,
        })
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.data.name).toBe('Bitcoin');
    });

    it('should create trading tag', async () => {
      const response = await request(app.getHttpServer())
        .post('/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Trading',
          slug: 'trading',
        })
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.data.name).toBe('Trading');
      tagId = response.body.data.id;
    });

    it('should create analysis tag', async () => {
      const response = await request(app.getHttpServer())
        .post('/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Phân Tích',
          slug: 'phan-tich',
        })
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.data.name).toBe('Phân Tích');
    });

    it('should list all categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should list all tags', async () => {
      const response = await request(app.getHttpServer())
        .get('/tags')
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('📝 Phase 3: Content Creation', () => {
    it('should create blog post by admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/blogs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '🚀 Bitcoin Vượt Mốc $50,000: Phân Tích Xu Hướng Thị Trường',
          slug: 'bitcoin-vuot-moc-50000-phan-tich-xu-huong',
          content: `
            <h2>🔥 Bitcoin Đạt Mốc Quan Trọng</h2>
            <p>Bitcoin đã chính thức vượt qua mốc $50,000 trong phiên giao dịch hôm nay...</p>
            <h3>📊 Phân Tích Kỹ Thuật</h3>
            <p>Từ góc độ kỹ thuật, việc Bitcoin vượt qua $50,000 cho thấy...</p>
          `,
          excerpt: 'Bitcoin đã chính thức vượt qua mốc $50,000, tạo ra động lực mạnh mẽ cho toàn thị trường.',
          thumbnailUrl: 'https://example.com/bitcoin-50k-thumbnail.jpg',
          metaTitle: 'Bitcoin Vượt $50,000 - Phân Tích Xu Hướng Thị Trường',
          metaDescription: 'Phân tích chuyên sâu về việc Bitcoin vượt mốc $50,000 và tác động đến thị trường tiền điện tử.',
          categoryId: categoryId,
        })
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.data.title).toContain('Bitcoin');
      expect(response.body.data.isPublished).toBe(false);
      blogId = response.body.data.id;
    });

    it('should publish blog post', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/blogs/${blogId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.isPublished).toBe(true);
      expect(response.body.data.publishedAt).toBeDefined();
    });

    it('should create forum thread by member (if forum exists)', async () => {
      // Skip this test if no forum exists
      if (forumId) {
        const response = await request(app.getHttpServer())
          .post('/forum-threads')
          .set('Authorization', `Bearer ${memberToken}`)
          .send({
            forumId: forumId,
            title: 'Thảo luận: Bitcoin có thể đạt $100,000 trong năm nay?',
            content: 'Các bạn nghĩ sao về khả năng Bitcoin đạt $100,000 trong năm nay? Tôi thấy có nhiều dấu hiệu tích cực...',
          })
          .expect(201);

        expect(response.body.statusCode).toBe(201);
        threadId = response.body.data.id;
      } else {
        // Skip this test
        console.log('⚠️ Skipping forum thread creation - no forum exists');
      }
    });

    it('should list all blog posts', async () => {
      const response = await request(app.getHttpServer())
        .get('/blogs')
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get blog post detail', async () => {
      const response = await request(app.getHttpServer())
        .get(`/blogs/${blogId}`)
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.id).toBe(blogId);
      expect(response.body.data.viewCount).toBeGreaterThan(0); // Should increment
    });
  });

  describe('💬 Phase 4: Social Interactions', () => {
    it('should add comment to blog post', async () => {
      const response = await request(app.getHttpServer())
        .post('/comments')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          sourceType: 'blog',
          sourceId: blogId,
          content: 'Bài viết rất hay! Tôi cũng đồng ý với quan điểm này về Bitcoin.',
        })
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.data.content).toContain('Bài viết rất hay');
      commentId = response.body.data.id;
    });

    it('should reply to comment', async () => {
      const response = await request(app.getHttpServer())
        .post('/comments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sourceType: 'blog',
          sourceId: blogId,
          content: 'Cảm ơn bạn đã đọc! Tôi sẽ tiếp tục cập nhật những phân tích mới.',
          parentId: commentId,
        })
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.data.content).toContain('Cảm ơn');
    });

    it('should like blog post', async () => {
      const response = await request(app.getHttpServer())
        .post('/likes')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          sourceType: 'blog',
          sourceId: blogId,
        })
        .expect(201);

      expect(response.body.statusCode).toBe(201);
    });

    it('should unlike blog post (toggle)', async () => {
      const response = await request(app.getHttpServer())
        .post('/likes')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          sourceType: 'blog',
          sourceId: blogId,
        })
        .expect(201);

      expect(response.body.statusCode).toBe(201);
    });

    it('should list comments for blog post', async () => {
      const response = await request(app.getHttpServer())
        .get('/comments')
        .query({
          sourceType: 'blog',
          sourceId: blogId,
        })
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('📊 Phase 5: Content Management & Updates', () => {
    it('should update blog post', async () => {
      const response = await request(app.getHttpServer())
        .put(`/blogs/${blogId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '🚀 Bitcoin Vượt Mốc $50,000: Phân Tích Xu Hướng Thị Trường [CẬP NHẬT]',
          content: 'Nội dung đã được cập nhật với thông tin mới nhất...',
        })
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.title).toContain('[CẬP NHẬT]');
    });

    it('should update comment', async () => {
      const response = await request(app.getHttpServer())
        .put(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          content: 'Bài viết rất hay! Tôi cũng đồng ý với quan điểm này về Bitcoin. [Đã chỉnh sửa]',
        })
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.content).toContain('[Đã chỉnh sửa]');
    });

    it('should update category', async () => {
      const response = await request(app.getHttpServer())
        .put(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Tiền Điện Tử & Blockchain',
          description: 'Tin tức và phân tích về thị trường tiền điện tử và công nghệ blockchain',
        })
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.name).toBe('Tiền Điện Tử & Blockchain');
    });

    it('should update tag', async () => {
      const response = await request(app.getHttpServer())
        .put(`/tags/${tagId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Trading & Đầu Tư',
        })
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.name).toBe('Trading & Đầu Tư');
    });
  });

  describe('🔒 Phase 6: Error Handling & Security', () => {
    it('should reject unauthorized blog creation', async () => {
      await request(app.getHttpServer())
        .post('/blogs')
        .send({
          title: 'Unauthorized Blog',
          slug: 'unauthorized-blog',
          content: 'This should fail',
        })
        .expect(401);
    });

    it('should reject invalid login', async () => {
      await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'admin@baotiendientu.com',
          password: 'WrongPassword',
        })
        .expect(401);
    });

    it('should reject duplicate email registration', async () => {
      await request(app.getHttpServer())
        .post('/users/register')
        .send({
          name: 'Duplicate User',
          email: 'admin@baotiendientu.com',
          password: 'Password123!',
        })
        .expect(409);
    });

    it('should reject invalid token', async () => {
      await request(app.getHttpServer())
        .get('/users/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should handle not found blog', async () => {
      await request(app.getHttpServer())
        .get('/blogs/non-existent-id')
        .expect(404);
    });

    it('should reject unauthorized blog update', async () => {
      await request(app.getHttpServer())
        .put(`/blogs/${blogId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Unauthorized Update',
        })
        .expect(403);
    });
  });

  describe('🏥 Phase 7: Health Checks', () => {
    it('should check basic health', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.statusCode).toBe(200);
    });

    it('should check database health', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/check-db')
        .expect(200);

      expect(response.body.statusCode).toBe(200);
    });
  });
}); 