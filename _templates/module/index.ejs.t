---
to: .
---
<%_ 
  // Normalize module name
  const Name = name.charAt(0).toUpperCase() + name.slice(1);
  const lower = name.toLowerCase();

  // Helper to check folder existence at runtime
  const fs = require('fs');
  function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Ensure base folders exist
  ensureDir(`src/domain/${lower}`);
  ensureDir(`src/application/${lower}`);
  ensureDir(`src/infrastructure/${lower}`);
  // Presentation folder created conditionally below
_%>


<%_ // === INFRASTRUCTURE LAYER === _%>
<%_ // 1. Mongoose Schema _%>
--- _templates/module/files/infrastructure/mongoose/schemas/__name__.schema.ts.ejs
to: src/infrastructure/mongoose/schemas/<%= Name %>.schema.ts
---
<%_ // 2. Repository Implementation _%>
--- _templates/module/files/infrastructure/mongoose/repositories/__name__.repository.ts.ejs
to: src/infrastructure/mongoose/repositories/<%= Name %>Repository.ts
---
<%_ // 3. Infrastructure Module _%>
--- _templates/module/files/infrastructure/__name__.module.ts.ejs
to: src/infrastructure/<%= Name %>Module.ts
---

<%_ // === DOMAIN LAYER === _%>
<%_ // 1. Entity _%>
--- _templates/module/files/domain/entities/__name__.entity.ts.ejs
to: src/domain/<%= lower %>/entities/<%= Name %>.entity.ts
---
<%_ // 2. Value Object _%>
--- _templates/module/files/domain/value-objects/__name__.vo.ts.ejs
to: src/domain/<%= lower %>/value-objects/<%= Name %>VO.ts
---
<%_ // 3. Domain Service _%>
--- _templates/module/files/domain/services/__name__.service.ts.ejs
to: src/domain/<%= lower %>/services/<%= Name %>Service.ts
---
<%_ // 4. Repository interface _%>
--- _templates/module/files/domain/repositories/__name__.repository.interface.ts.ejs
to: src/domain/<%= lower %>/repositories/I<%= Name %>Repository.ts
---
<%_ // 5. Domain Module _%>
--- _templates/module/files/domain/__name__.module.ts.ejs
to: src/domain/<%= lower %>/<%= Name %>Module.ts
---

<%_ // === APPLICATION LAYER === _%>
<%_ // 1. Input DTO _%>
--- _templates/module/files/application/dto/inputs/__name__.input.ts.ejs
to: src/application/<%= lower %>/dto/inputs/Create<%= Name %>Input.ts
---
<%_ // 2. Output DTO _%>
--- _templates/module/files/application/dto/models/__name__.dto.ts.ejs
to: src/application/<%= lower %>/dto/models/<%= Name %>DTO.ts
---
<%_ // 3. Use Case _%>
--- _templates/module/files/application/use-cases/__name__.use-case.ts.ejs
to: src/application/<%= lower %>/use-cases/<%= Name %>UseCase.ts
---
<%_ // 4. Application Module _%>
--- _templates/module/files/application/__name__.module.ts.ejs
to: src/application/<%= lower %>/<%= Name %>Module.ts
---


<%_ // === PRESENTATION LAYER: GRAPHQL === _%>
<% if (presentation.includes('graphql')) { %>
<%_ // 1. GraphQL ObjectType _%>
--- _templates/module/files/presentation/graphql/object-types/__name__.object-type.ts.ejs
to: src/presentation/graphql/object-types/<%= Name %>ObjectType.ts
---
<%_ // 2. GraphQL InputType _%>
--- _templates/module/files/presentation/graphql/input-types/__name__.input-type.ts.ejs
to: src/presentation/graphql/input-types/Create<%= Name %>InputType.ts
---
<%_ // 3. GraphQL Resolver _%>
--- _templates/module/files/presentation/graphql/resolvers/__name__.resolver.ts.ejs
to: src/presentation/graphql/resolvers/<%= Name %>.resolver.ts
---
<%_ // 4. Patch import into GraphqlModule _%>
--- _templates/module/files/presentation/graphql/graphql.module.patch.ejs
to: src/presentation/graphql/graphql.module.ts
append: true
---
<% } %>

<%_ // === PRESENTATION LAYER: REST === _%>
<% if (presentation.includes('rest')) { %>
<%_ // 1. REST Controller _%>
--- _templates/module/files/presentation/rest/controllers/__name__.controller.ts.ejs
to: src/presentation/rest/controllers/<%= Name %>Controller.ts
---
<%_ // 2. REST DTOs reuse Application DTOs _%>
<%_ // 3. Patch import into RestModule (tương tự GraphqlModule) _%>
--- _templates/module/files/presentation/rest/rest.module.patch.ejs
to: src/presentation/rest/rest.module.ts
append: true
---
<% } %>
