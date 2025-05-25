---
to: .
---

<%_ 
  # const fs = require('fs');
  # const path = require('path');
  const toKebabCase = (str) =>
    str
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .toLowerCase();

  const Name = name.charAt(0).toUpperCase() + name.slice(1);
  const kebab = toKebabCase(name); 
  const camelCase = name.charAt(0).toLowerCase() + name.slice(1)

  # // Ensure folders exist
  # function ensureDir(dir) {
  #   if (!fs.existsSync(dir)) {
  #     fs.mkdirSync(dir, { recursive: true });
  #   }
  # }

  # ensureDir(`src/domain/${kebab}`);
  # ensureDir(`src/application/${kebab}`);
  # ensureDir(`src/infrastructure/${kebab}`);
  # if (presentations.includes('graphql')) {
  #   ensureDir('src/presentation/graphql/resolvers');
  #   ensureDir('src/presentation/graphql/object-types');
  #   ensureDir('src/presentation/graphql/input-types');
  # }
  # if (presentations.includes('rest')) {
  #   ensureDir('src/presentation/rest/controllers');
  # }
_%>

<%_ // === INFRASTRUCTURE LAYER === _%>
--- _templates/module/files/infrastructure/mongoose/schemas/__name__.schema.ts.ejs
to: src/infrastructure/mongoose/schemas/<%= kebab %>.schema.ts
---
--- _templates/module/files/infrastructure/mongoose/schemas/index.ts.patch.ejs
to: src/infrastructure/mongoose/schemas/index.ts
append: true
---

--- _templates/module/files/infrastructure/mongoose/repositories/__name__.repository.ts.ejs
to: src/infrastructure/mongoose/repositories/<%= kebab %>.repository.ts
---

--- _templates/module/files/infrastructure/mongoose/repositories/index.ts.patch.ejs
to: src/infrastructure/mongoose/repositories/index.ts
append: true
---

<%_ // === DOMAIN LAYER === _%>
--- _templates/module/files/domain/value-objects/__name__.value-object.ts.ejs
to: src/domain/<%= kebab %>/value-objects/<%= kebab %>.value-object.ts
---

--- _templates/module/files/domain/value-objects/index.ts.ejs
to: src/domain/<%= kebab %>/value-objects/index.ts
---

--- _templates/module/files/domain/services/__name__.service.ts.ejs
to: src/domain/<%= kebab %>/services/<%= kebab %>.service.ts
---

--- _templates/module/files/domain/services/index.ts.ejs
to: src/domain/<%= kebab %>/services/index.ts
---

--- _templates/module/files/domain/repositories/__name__.repository.abstract.ts.ejs
to: src/domain/<%= kebab %>/repositories/a<%= kebab %>.repository.ts
---

--- _templates/module/files/domain/repositories/index.ts.ejs
to: src/domain/<%= kebab %>/repositories/index.ts
---

--- _templates/module/files/domain/__name__.module.ts.ejs
to: src/domain/<%= kebab %>/<%= kebab %>.module.ts
---


<%_ // === APPLICATION LAYER === _%>
--- _templates/module/files/application/use-cases/fetch-__name__.use-case.ts.ejs
to: src/application/<%= kebab %>/use-cases/fetch-<%= kebab %>.service.ts
---

--- _templates/module/files/application/use-cases/get-one-__name__-by-condition.use-case.ts.ejs
to: src/application/<%= kebab %>/use-cases/get-one-<%= kebab %>-by-condition.service.ts
---

--- _templates/module/files/application/use-cases/create-__name__.use-case.ts.ejs
to: src/application/<%= kebab %>/use-cases/create-<%= kebab %>.service.ts
---

--- _templates/module/files/application/use-cases/update-one-__name__-by-condition.use-case.ts.ejs
to: src/application/<%= kebab %>/use-cases/update-one-<%= kebab %>-by-condition.service.ts
---

--- _templates/module/files/application/use-cases/delete-one-__name__-by-condition.use-case.ts.ejs
to: src/application/<%= kebab %>/use-cases/delete-one-<%= kebab %>-by-condition.service.ts
---

--- _templates/module/files/application/use-cases/index.ts.ejs
to: src/application/<%= kebab %>/use-cases/index.ts
---

--- _templates/module/files/application/__name__.module.ts.ejs
to: src/application/<%= kebab %>/<%= kebab %>.module.ts
---

--- _templates/module/files/application/index.ts.ejs
to: src/application/<%= kebab %>/index.ts
---


<%_ // === GRAPHQL === _%>
<% if (presentations.includes('graphql')) { %>
--- _templates/module/files/presentation/graphql/input-types/__name__/create-__name__.input-type.ts.ejs
to: src/presentation/graphql/input-types/<%= kebab %>/create-<%= kebab %>.input-type.ts
---

--- _templates/module/files/presentation/graphql/input-types/__name__/update-__name__.input-type.ts.ejs
to: src/presentation/graphql/input-types/<%= kebab %>/update-<%= kebab %>.input-type.ts
---

--- templates/module/files/presentation/graphql/input-types/__name__/index.ts.ejs
to: src/presentation/graphql/input-types/<%= kebab %>/index.ts
---

--- _templates/module/files/presentation/graphql/object-types/__name__/__name__.object-type.ts.ejs
to: src/presentation/graphql/object-types/<%= kebab %>.object-type.ts
---

--- templates/module/files/presentation/graphql/object-types/__name__/index.ts.ejs
to: src/presentation/graphql/object-types/<%= kebab %>/index.ts
---

--- _templates/module/files/presentation/graphql/object-types/index.ts.ejs
to: src/presentation/graphql/object-types/index.ts
append: true
---


--- _templates/module/files/presentation/graphql/resolvers/__name__.resolver.ts.ejs
to: src/presentation/graphql/resolvers/<%= kebab %>.resolver.ts
---

--- _templates/module/files/presentation/graphql/resolvers/index.ts.ejs
to: src/presentation/graphql/resolvers/index.ts
append: true
---

# Patch GraphqlModule: cập nhật barrel imports và @Module.imports
--- _templates/module/files/presentation/graphql/graphql.module.patch.ejs
to: src/presentation/graphql/graphql.module.ts
modify: true
---
<% } %>

<%_ // === REST === _%>
<% if (presentations.includes('rest')) { %>
--- _templates/module/files/presentation/rest/controllers/__name__.controller.ts.ejs
to: src/presentation/rest/controllers/<%= kebab %>.controller.ts
---

--- _templates/module/files/presentation/rest/rest.module.patch.ejs
to: src/presentation/rest/rest.module.ts
append: true
---
<% } %>
