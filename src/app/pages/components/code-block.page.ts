import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiCodeBlock } from '../../shared/ui/code-block/code-block';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon, UiCodeBlock],
  templateUrl: './code-block.page.html',
})
export class CodeBlockPage {
  protected readonly basic = `const total = items.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0,
);

return formatCurrency(total, 'IDR');`;

  protected readonly header = `export function greet(name: string): string {
  return \`Halo, \${name}!\`;
}`;

  protected readonly wrap = `const message = 'Baris ini sengaja dibuat sangat panjang untuk menunjukkan bahwa opsi wrap membuat kode membungkus ke baris berikutnya tanpa scroll horizontal.';`;

  protected readonly diff = `-const total = price * quantity;
+const total = price * quantity + tax;
+const rounded = Math.round(total * 100) / 100;

-console.log(total);
+console.log(rounded);`;

  protected readonly highlighted = `function createUser(input: UserInput) {
  const user = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
  };

  return user;
}`;

  protected readonly longCode = Array.from(
    { length: 24 },
    (_, index) =>
      `// Langkah ${index + 1}: proses data dan simpan hasilnya\nawait step${index + 1}();`,
  ).join('\n');

  protected readonly errorCode = `Error: connect ECONNREFUSED 127.0.0.1:5432
    at TCPConnectWrap.afterConnect (node:net:1595:16)
    at Pool.connect (pg-pool/index.js:258:11)
    at Database.query (db.ts:42:9)`;
}
