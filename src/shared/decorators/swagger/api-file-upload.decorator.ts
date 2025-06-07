import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiConsumes } from "@nestjs/swagger/dist";

export function ApiFileUpload(body: any) {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: body }),
  );
}
