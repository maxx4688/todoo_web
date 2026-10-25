// Minimal, dependency-free Markdown renderer.
// All input is HTML-escaped first, so output is safe to assign to innerHTML.
const Markdown = {
    // Markdown links/images: [text](url) and ![alt](url)
    LINK_PATTERN: /!?\[[^\]\n]*\]\([^)\s]+(?:\s+"[^"]*")?\)/g,

    escape(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },

    safeUrl(url) {
        const trimmed = url.trim();
        if (/^(https?:\/\/|mailto:)/i.test(trimmed)) return trimmed;
        if (/^www\./i.test(trimmed)) return 'https://' + trimmed;
        return null;
    },

    // Inline formatting on already-escaped text.
    inline(escaped) {
        const stash = [];
        const hold = (html) => `\u0000${stash.push(html) - 1}\u0000`;

        let out = escaped;

        // Inline code first so its contents are left untouched
        out = out.replace(/`([^`\n]+)`/g, (_, code) => hold(`<code>${code}</code>`));

        // Images and links
        out = out.replace(/!\[([^\]\n]*)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, (m, alt, url) => {
            const safe = this.safeUrl(url);
            return safe ? hold(`<img src="${safe}" alt="${alt}" loading="lazy">`) : m;
        });
        out = out.replace(/\[([^\]\n]+)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, (m, label, url) => {
            const safe = this.safeUrl(url);
            return safe ? hold(`<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`) : m;
        });

        out = out
            .replace(/\*\*\*([^*\n]+)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
            .replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
            .replace(/(^|[^*\w])\*([^*\s][^*\n]*?)\*(?!\*)/g, '$1<em>$2</em>')
            .replace(/(^|[^_\w])_([^_\s][^_\n]*?)_(?![_\w])/g, '$1<em>$2</em>')
            .replace(/~~([^~\n]+)~~/g, '<del>$1</del>');

        return out.replace(/\u0000(\d+)\u0000/g, (_, i) => stash[Number(i)]);
    },

    // Single line (e.g. a title): inline formatting only.
    renderInline(text) {
        return this.inline(this.escape(text));
    },

    // Strip bare URLs (shown separately as chips) but keep markdown links intact.
    stripBareUrls(text) {
        return text.replace(/(!?\[[^\]\n]*\]\([^)\s]+(?:\s+"[^"]*")?\))|(https?:\/\/[^\s]+|www\.[^\s]+)/gi,
            (m, link) => link || '').trim();
    },

    // Bare URLs only, ignoring those inside markdown links.
    extractBareUrls(text) {
        const withoutLinks = text.replace(this.LINK_PATTERN, ' ');
        return withoutLinks.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi) || [];
    },

    // Block-level rendering.
    render(text) {
        const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
        const html = [];
        let i = 0;

        const isBlockStart = (line) =>
            /^\s*(```|#{1,6}\s|>\s?|[-*+]\s|\d+[.)]\s|([-*_])(\s*\2){2,}\s*$)/.test(line);

        while (i < lines.length) {
            const line = lines[i];

            if (!line.trim()) { i++; continue; }

            // Fenced code block
            const fence = line.match(/^\s*```\s*([\w-]*)\s*$/);
            if (fence) {
                const code = [];
                i++;
                while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) code.push(lines[i++]);
                i++; // closing fence
                html.push(`<pre><code>${this.escape(code.join('\n'))}</code></pre>`);
                continue;
            }

            // Heading
            const heading = line.match(/^\s*(#{1,6})\s+(.*?)\s*#*\s*$/);
            if (heading) {
                const level = heading[1].length;
                html.push(`<h${level}>${this.renderInline(heading[2])}</h${level}>`);
                i++;
                continue;
            }

            // Horizontal rule
            if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
                html.push('<hr>');
                i++;
                continue;
            }

            // Blockquote
            if (/^\s*>/.test(line)) {
                const quote = [];
                while (i < lines.length && /^\s*>/.test(lines[i])) {
                    quote.push(lines[i].replace(/^\s*>\s?/, ''));
                    i++;
                }
                html.push(`<blockquote>${this.render(quote.join('\n'))}</blockquote>`);
                continue;
            }

            // Lists (flat; indentation is not nested)
            const listMatch = line.match(/^\s*([-*+]|\d+[.)])\s+/);
            if (listMatch) {
                const ordered = /\d/.test(listMatch[1]);
                const items = [];
                while (i < lines.length) {
                    const m = lines[i].match(/^\s*([-*+]|\d+[.)])\s+(.*)$/);
                    if (!m || /\d/.test(m[1]) !== ordered) break;
                    items.push(m[2]);
                    i++;
                }
                const tag = ordered ? 'ol' : 'ul';
                const body = items.map((item) => {
                    const task = item.match(/^\[([ xX])\]\s+(.*)$/);
                    if (task) {
                        const done = task[1] !== ' ';
                        return `<li class="md-task${done ? ' is-done' : ''}"><input type="checkbox" disabled${done ? ' checked' : ''}> ${this.renderInline(task[2])}</li>`;
                    }
                    return `<li>${this.renderInline(item)}</li>`;
                }).join('');
                html.push(`<${tag}>${body}</${tag}>`);
                continue;
            }

            // Paragraph: consecutive non-blank lines that don't start another block
            const para = [line];
            i++;
            while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
                para.push(lines[i++]);
            }
            html.push(`<p>${para.map((l) => this.renderInline(l)).join('<br>')}</p>`);
        }

        return html.join('');
    }
};

window.Markdown = Markdown;
