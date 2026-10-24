export function ThemeScript() {
  const code = `(function(){try{var k='conestone-theme';var t=localStorage.getItem(k);if(t!=='dark'&&t!=='light'){t='light';}document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: code }}
      suppressHydrationWarning
    />
  );
}
