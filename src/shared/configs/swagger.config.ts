import { DocumentBuilder } from '@nestjs/swagger';

export const configSwagger = new DocumentBuilder()
  .addBearerAuth({
    name: 'Access token',
    type: 'http',
    bearerFormat: 'JWT',
  })
  .setTitle('Documention API')
  .setDescription(
    '<h3>📋 Query Parameters Usage</h3> <ul> <li> <strong><code>search</code></strong><br/> Tìm kiếm tổng quát trên các trường văn bản (ví dụ: email, tên).<br/> Ví dụ: <code>?search=john</code> sẽ trả về tất cả bản ghi chứa "john". </li> <li> <strong><code>filter</code></strong><br/> Lọc chi tiết bằng JSON với các toán tử:<br/> <code>$eq</code>, <code>$ne</code>, <code>$gt</code>, <code>$gte</code>, <code>$lt</code>, <code>$lte</code>, <code>$in</code>, <code>$nin</code>, <code>$or</code>, <code>$and</code>.<br/> Ví dụ: <code>?filter={"age":{"$gte":18},"status":{"$eq":"active"}}</code> </li> <li> <strong><code>limit</code></strong><br/> Số bản ghi trên mỗi trang. Mặc định 10.<br/> Ví dụ: <code>?limit=20</code> </li> <li> <strong><code>page</code></strong><br/> Số trang (bắt đầu từ 1).<br/> Ví dụ: <code>?page=2&amp;limit=20</code> sẽ trả bản ghi từ 21–40. </li> <li> <strong><code>sort</code></strong><br/> Sắp xếp theo trường, tiền tố <code>-</code> cho giảm dần.<br/> Ví dụ: <code>?sort={"createdAt":-1}</code> hoặc <code>?sort={"createdAt":1}</code> </li> </ul>',
  )

  .setVersion('1.0')
  .build();
