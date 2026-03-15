type DemoLocale = "zh-CN" | "en-US";

type DemoCard = {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
};

type DemoCopy = {
  badge: string;
  title: string;
  subtitle: string;
  note: string;
  steps: string[];
  proof: {
    eyebrow: string;
    title: string;
    checklist: string[];
  };
  cardsSectionTitle: string;
  cardsSectionCopy: string;
  cards: {
    position: DemoCard;
    size: DemoCard;
    describe: DemoCard;
  };
  workspace: {
    title: string;
    copy: string;
    structureTitle: string;
    structureItems: string[];
    previewTitle: string;
    previewItems: string[];
    footer: string;
  };
};

const messages: Record<DemoLocale, DemoCopy> = {
  "zh-CN": {
    badge: "AI UI Runtime 本地演示页",
    title: "在真实页面里调 UI，再把上下文复制给 AI",
    subtitle:
      "这个 demo 故意保持简单。你可以直接选中容器、卡片、标题区或按钮区，快速演示“位置调整、尺寸调整、文字描述”三条主路径。",
    note: "推荐录屏路径：启用调试 -> 选中下面任意模块 -> 做调整 -> 复制给 AI。",
    steps: ["启用当前页调试", "直接选中目标", "调整位置或尺寸", "补充文字要求", "复制给 AI"],
    proof: {
      eyebrow: "为什么这个页面适合录屏",
      title: "每个区域都对应一个真实产品动作",
      checklist: [
        "容器、标题、按钮、列表都在同一页，方便切换目标。",
        "每个关键模块都带有 id / data-testid / aria-label，利于 AI 定位源码。",
        "页面本身不再自带右上角工具样式，不会和扩展 overlay 混淆。"
      ]
    },
    cardsSectionTitle: "推荐演示目标",
    cardsSectionCopy: "优先录这三个卡片，最容易说明项目价值。",
    cards: {
      position: {
        eyebrow: "位置",
        title: "拖动这个模块做布局调整",
        description: "适合演示单个卡片移动，或者 Ctrl / Cmd 多选后整体移动。",
        action: "演示位置调整"
      },
      size: {
        eyebrow: "尺寸",
        title: "缩放这个信息面板",
        description: "适合演示容器宽高变化，不需要修改真实源代码也能看到反馈。",
        action: "演示尺寸调整"
      },
      describe: {
        eyebrow: "描述",
        title: "给这个内容区写修改要求",
        description: "适合演示不做拖拽，只写 prompt 也能生成更准确的 AI 上下文。",
        action: "演示文字调整"
      }
    },
    workspace: {
      title: "一个更像真实业务页的工作区",
      copy: "下面保留了常见的左侧配置区和右侧内容区，便于你录屏时展示层级定位能力。",
      structureTitle: "左侧配置区",
      structureItems: ["品牌区", "状态筛选", "动作按钮", "规则列表"],
      previewTitle: "右侧内容区",
      previewItems: ["标题栏", "摘要卡片", "内容栅格", "说明文案"],
      footer: "你也可以故意选中文本节点，看看扩展如何补更多父级容器线索。"
    }
  },
  "en-US": {
    badge: "AI UI Runtime Demo",
    title: "Adjust real UI, then copy better context for AI",
    subtitle:
      "This demo is intentionally simple. You can directly target containers, cards, title blocks, and button groups to show the three main paths: position, size, and describe.",
    note: "Recommended recording flow: enable debug -> select a target -> adjust it -> copy for AI.",
    steps: ["Enable debug", "Select a target", "Adjust position or size", "Add a written request", "Copy for AI"],
    proof: {
      eyebrow: "Why this page works well for recording",
      title: "Every area maps to a real product action",
      checklist: [
        "Containers, headings, buttons, and lists all live on one page.",
        "Key modules include id / data-testid / aria-label hints for better source matching.",
        "The page itself no longer includes a fake top-right tool UI that competes with the extension."
      ]
    },
    cardsSectionTitle: "Recommended demo targets",
    cardsSectionCopy: "These three cards are the clearest way to explain the product value.",
    cards: {
      position: {
        eyebrow: "Position",
        title: "Drag this module to preview layout changes",
        description: "Good for showing a single-card move or a grouped multi-select move.",
        action: "Show position flow"
      },
      size: {
        eyebrow: "Size",
        title: "Resize this information panel",
        description: "Good for showing width and height changes without touching real source code yet.",
        action: "Show size flow"
      },
      describe: {
        eyebrow: "Describe",
        title: "Write a change request for this content block",
        description: "Good for showing that typed instructions also become structured AI-ready context.",
        action: "Show describe flow"
      }
    },
    workspace: {
      title: "A cleaner workspace that still feels real",
      copy: "The lower section keeps a common left-config / right-content layout so you can demonstrate hierarchy-aware targeting.",
      structureTitle: "Left config column",
      structureItems: ["Brand block", "State filters", "Action buttons", "Rules list"],
      previewTitle: "Right content column",
      previewItems: ["Header bar", "Summary card", "Content grid", "Supporting copy"],
      footer: "You can also intentionally select a text node to show how the extension adds parent-container clues."
    }
  }
};

function getDemoLocale(): DemoLocale {
  return navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en-US";
}

function App(): JSX.Element {
  const locale = getDemoLocale();
  const copy = messages[locale];

  return (
    <div className="demo-shell">
      <main className="demo-page">
        <section className="hero-card" id="demo-hero" data-testid="demo-hero" aria-label={copy.badge}>
          <div className="hero-card__copy">
            <p className="eyebrow">{copy.badge}</p>
            <h1>{copy.title}</h1>
            <p className="hero-card__subtitle">{copy.subtitle}</p>
            <p className="hero-card__note">{copy.note}</p>

            <div className="step-strip" aria-label={locale === "zh-CN" ? "演示步骤" : "Demo steps"}>
              {copy.steps.map((step, index) => (
                <span className="step-chip" key={step}>
                  <strong>{index + 1}</strong>
                  {step}
                </span>
              ))}
            </div>
          </div>

          <aside
            className="proof-card"
            id="proof-card"
            data-testid="proof-card"
            data-slot="proof-card"
            aria-label={copy.proof.title}
          >
            <p className="eyebrow">{copy.proof.eyebrow}</p>
            <h2>{copy.proof.title}</h2>
            <ul className="proof-list">
              {copy.proof.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="section-head">
          <div>
            <p className="eyebrow">{copy.cardsSectionTitle}</p>
            <h2>{copy.cardsSectionCopy}</h2>
          </div>
        </section>

        <section className="value-grid" aria-label={copy.cardsSectionTitle}>
          <article
            className="value-card value-card--position"
            id="position-card"
            data-testid="position-card"
            data-slot="demo-card"
            aria-label={copy.cards.position.title}
          >
            <p className="eyebrow">{copy.cards.position.eyebrow}</p>
            <h3>{copy.cards.position.title}</h3>
            <p>{copy.cards.position.description}</p>
            <button className="demo-button" type="button">
              {copy.cards.position.action}
            </button>
          </article>

          <article
            className="value-card value-card--size"
            id="size-card"
            data-testid="size-card"
            data-slot="demo-card"
            aria-label={copy.cards.size.title}
          >
            <p className="eyebrow">{copy.cards.size.eyebrow}</p>
            <h3>{copy.cards.size.title}</h3>
            <p>{copy.cards.size.description}</p>
            <button className="demo-button" type="button">
              {copy.cards.size.action}
            </button>
          </article>

          <article
            className="value-card value-card--describe"
            id="describe-card"
            data-testid="describe-card"
            data-slot="demo-card"
            aria-label={copy.cards.describe.title}
          >
            <p className="eyebrow">{copy.cards.describe.eyebrow}</p>
            <h3>{copy.cards.describe.title}</h3>
            <p>{copy.cards.describe.description}</p>
            <button className="demo-button" type="button">
              {copy.cards.describe.action}
            </button>
          </article>
        </section>

        <section
          className="workspace-card"
          id="workspace-shell"
          data-testid="workspace-shell"
          aria-label={copy.workspace.title}
        >
          <div className="workspace-card__intro">
            <p className="eyebrow">{copy.workspace.title}</p>
            <h2>{copy.workspace.copy}</h2>
          </div>

          <div className="workspace-grid">
            <aside
              className="workspace-panel"
              id="config-panel"
              data-testid="config-panel"
              data-slot="config-panel"
              aria-label={copy.workspace.structureTitle}
            >
              <div className="workspace-panel__header">
                <strong>{copy.workspace.structureTitle}</strong>
                <span className="panel-badge">config</span>
              </div>
              <ul className="panel-list">
                {copy.workspace.structureItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="button-group">
                <button className="demo-button demo-button--secondary" type="button">
                  Apply
                </button>
                <button className="demo-button demo-button--ghost" type="button">
                  Reset
                </button>
              </div>
            </aside>

            <section
              className="workspace-panel workspace-panel--content"
              id="preview-panel"
              data-testid="preview-panel"
              data-slot="preview-panel"
              aria-label={copy.workspace.previewTitle}
            >
              <div className="workspace-panel__header">
                <strong>{copy.workspace.previewTitle}</strong>
                <span className="panel-badge">preview</span>
              </div>

              <div className="content-stack">
                <header className="content-bar" id="preview-header" data-testid="preview-header">
                  <div>
                    <p className="eyebrow">Live block</p>
                    <h3>Studio Surface</h3>
                  </div>
                  <button className="demo-button demo-button--ghost" type="button">
                    Share
                  </button>
                </header>

                <article className="summary-card" id="summary-card" data-testid="summary-card" aria-label="Summary card">
                  <strong>72%</strong>
                  <p>{locale === "zh-CN" ? "当前录屏脚本已准备完成" : "Recording script is ready"}</p>
                </article>

                <div className="mini-grid" id="content-grid" data-testid="content-grid">
                  {copy.workspace.previewItems.map((item) => (
                    <article className="mini-card" key={item}>
                      <span>{item}</span>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <p className="workspace-footnote">{copy.workspace.footer}</p>
        </section>
      </main>
    </div>
  );
}

export default App;
