import React, { useRef } from "react";
import Icon from "../../assets/GearSix.svg";
import localeTexts from "../../common/locales/en-us/index";
import parse from "html-react-parser";
import styles from "./AppConfiguration.module.css";
import { useInstallationData } from "../../common/hooks/useInstallationData";
import Tooltip from "../Tooltip/Tooltip";

const AppConfigurationExtension: React.FC = () => {
  const { installationData, setInstallationData } = useInstallationData();
  const geminiApiKeyRef = useRef<HTMLInputElement>(null);
  const geminiModelRef = useRef<HTMLSelectElement>(null);
  const managementTokenRef = useRef<HTMLInputElement>(null);

  const updateConfig = async () => {
    if (typeof setInstallationData !== "undefined") {
      const configData = {
        configuration: { 
          gemini_model: geminiModelRef.current?.value || "gemini-2.5-flash",
          gemini_api_key: geminiApiKeyRef.current?.value,
          management_token: managementTokenRef.current?.value
        },
        serverConfiguration: {}, 
      };
      await setInstallationData(configData);
    }
  };

  return (
    <div className={`${styles.layoutContainer}`}>
      <div className={`${styles.appConfig}`}>
        <div className={`${styles.appConfigLogoContainer}`}>
          <img src={Icon} alt="icon" />
          <p>{localeTexts.ConfigScreen.title}</p>
        </div>

        <div className={`${styles.configWrapper}`}>
          <div className={`${styles.configContainer}`}>
            <div className={`${styles.infoContainerWrapper}`}>
              <div className={`${styles.infoContainer}`}>
                <div className={`${styles.labelWrapper}`}>
                  <label htmlFor="geminiApiKey">🔑 Gemini API Key</label>
                  <Tooltip content="Your Gemini API key from Google AI Studio. This is stored securely and shared with the app via server configuration." />
                </div>
              </div>
              <div className={`${styles.inputContainer}`}>
                <input
                  type="password"
                  ref={geminiApiKeyRef}
                  required
                  value={(installationData.configuration as any).gemini_api_key as string || ""}
                  placeholder="Enter your Gemini API Key"
                  name="geminiApiKey"
                  autoComplete="off"
                  className={`${styles.fieldInput}`}
                  onChange={updateConfig} />
              </div>
            </div>
          </div>

          <div className={`${styles.configContainer}`}>
            <div className={`${styles.infoContainerWrapper}`}>
              <div className={`${styles.infoContainer}`}>
                <div className={`${styles.labelWrapper}`}>
                  <label htmlFor="geminiModel">🤖 Gemini Model</label>
                  <Tooltip content="Select which Gemini model to use for translations. Recommended: gemini-2.5-flash for best performance." />
                </div>
              </div>
              <div className={`${styles.inputContainer}`}>
                <select
                  ref={geminiModelRef}
                  value={installationData.configuration.gemini_model as string || "gemini-2.5-flash"}
                  name="geminiModel"
                  className={`${styles.fieldInput}`}
                  onChange={updateConfig}
                  style={{ padding: "8px" }}
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended)</option>
                  <option value="gemini-2.5-pro-preview-03-25h">gemini-1.5-flash</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-2.5-flash-lite-preview-06-17">gemini-2.5-flash-lite-preview-06-17</option>
                </select>
              </div>
            </div>
            <div className={`${styles.descriptionContainer}`}>
              <p>
                Choose the Gemini model for translations. Flash models are faster and more cost-effective for most use cases.
              </p>
            </div>
          </div>

          <div className={`${styles.configContainer}`}>
            <div className={`${styles.infoContainerWrapper}`}>
              <div className={`${styles.infoContainer}`}>
                <div className={`${styles.labelWrapper}`}>
                  <label htmlFor="managementToken">🔐 Management Token</label>
                  <Tooltip content="Contentstack Management Token with permissions to create and update entries. Required for automatic entry localization." />
                </div>
              </div>
              <div className={`${styles.inputContainer}`}>
                <input
                  type="password"
                  ref={managementTokenRef}
                  required
                  value={(installationData.configuration as any).management_token as string || ""}
                  placeholder="Enter your Management Token"
                  name="managementToken"
                  autoComplete="off"
                  className={`${styles.fieldInput}`}
                  onChange={updateConfig} />
              </div>
            </div>
            <div className={`${styles.descriptionContainer}`}>
              <p>
                Required for creating localized entries automatically. 
                <a href="https://www.contentstack.com/docs/developers/create-tokens/generate-a-management-token/" target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1", marginLeft: "4px" }}>
                  Learn how to create a Management Token
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className={`${styles.locationDescription}`}>
          <div style={{ padding: "16px", backgroundColor: "#fffbeb", borderRadius: "8px", marginBottom: "16px", border: "1px solid #fbbf24" }}>
            <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: "#92400e" }}>⚠️ Security Notice:</p>
            <p style={{ margin: "0", fontSize: "14px", color: "#78350f", lineHeight: "1.5" }}>
              For <strong>frontend-only apps</strong>, the API key is stored in <code>configuration</code> and accessible to the frontend. 
              This is <strong>more secure than localStorage</strong> (no XSS vulnerabilities) but the key is visible to users with access to this stack.
              <br/><br/>
              <strong>For production apps:</strong> Use a backend service where API keys are stored in <code>serverConfiguration</code> 
              (only accessible to webhooks/backend) and proxy all API calls through your server.
              <a href="https://www.contentstack.com/docs/developers/developer-hub/build-custom-apps-using-extensions/" target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1", textDecoration: "underline", marginLeft: "4px" }}>
                Learn more
              </a>
            </p>
          </div>
          <p className={`${styles.locationDescriptionText}`}>{parse(localeTexts.ConfigScreen.body)}</p>
          <a target="_blank" rel="noreferrer" href={localeTexts.ConfigScreen.button.url}>
            <span className={`${styles.locationDescriptionLink}`}>{localeTexts.ConfigScreen.button.text}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AppConfigurationExtension;
